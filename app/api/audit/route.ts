import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLeads, auditRateLimits } from "@/db/schema";
import { notifyAuditTeam, optionalAcknowledgement } from "@/lib/audit-delivery";
import { getAuditRuntime } from "@/lib/audit-runtime";
import { allowAuditSubmission, submitAuditOnce } from "@/lib/audit-submission";
import { isSameOriginRequest } from "@/lib/audit-origin";
import { consentedPhone, parseAuditRequest, qualification } from "@/lib/audit-validation";

const unavailableMessage = "We couldn’t confirm delivery of your audit request. Your details are still in the form; please try again or email info@zykken.com.";

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function limitedJson(request: Request) {
  if (!request.body) throw new Error("Missing request");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12288) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(merged)) as unknown;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return json({ ok: false, message: "Please submit the request from this page." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ ok: false, message: "Please submit the form on this page." }, 415);
  let raw: unknown;
  try { raw = await limitedJson(request); } catch { return json({ ok: false, message: "We couldn’t read that request. Please check the form and try again." }, 400); }
  const parsed = parseAuditRequest(raw);
  if (!parsed.data) return json({ ok: false, errors: parsed.errors, message: "Please check the highlighted details and try again." }, 400);
  const data = parsed.data;
  if (data.company_site) return json({ ok: false, message: "We couldn’t accept this request. Please try again." }, 400);

  const config = getAuditRuntime();
  // Vercel uses the same mail endpoint and credentials as the main website.
  // A Cloudflare-only database or a separate visitor email key is not required.
  if (!config.DB) {
    try {
      // Vercel supplies this protected header. Local previews do not trust caller-supplied IPs.
      const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined : undefined;
      const retryAfter = await allowAuditSubmission(ip);
      if (retryAfter) return json({ ok: false, message: "There have been several requests from your connection. Please wait a few minutes and try again." }, 429, { "Retry-After": String(retryAfter) });
      const result = await submitAuditOnce(data, async savedData => {
        await notifyAuditTeam(savedData);
        await optionalAcknowledgement(savedData, config);
      });
      return json(result, result.ok ? 200 : result.status);
    } catch {
      return json({ ok: false, message: unavailableMessage }, 502);
    }
  }
  const now = new Date().toISOString();
  try {
    const db = getDb(config.DB);
    const bucket = Math.floor(Date.now() / 600000);
    // Cloudflare supplies this header. Never trust forwarded-for or persist raw IP addresses.
    const ip = request.headers.get("cf-connecting-ip") || "local";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${bucket}:${ip}`));
    const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const [limit] = await db.insert(auditRateLimits).values({ key, count: 1, expiresAt: (bucket + 1) * 600000 })
      .onConflictDoUpdate({ target: auditRateLimits.key, set: { count: sql`${auditRateLimits.count} + 1` } }).returning({ count: auditRateLimits.count });
    if (!limit || limit.count > 5) return json({ ok: false, message: "There have been several requests from your connection. Please wait a few minutes and try again." }, 429, { "Retry-After": String(Math.max(1, Math.ceil(((bucket + 1) * 600000 - Date.now()) / 1000))) });
    await db.delete(auditRateLimits).where(lt(auditRateLimits.expiresAt, Date.now()));

    await db.insert(auditLeads).values({
      id: data.requestId, createdAt: now, updatedAt: now,
      name: data.name, brokerage: data.brokerage, email: data.email, profile: data.profile,
      role: data.role, volume: data.volume, challenge: data.challenge,
      whatsapp: consentedPhone(data), whatsappConsent: data.whatsappConsent,
      attribution: data.attribution, priority: qualification(data), reviewStatus: "NEW", deliveryStatus: "PENDING",
    }).onConflictDoNothing();

    // Recover a claim only after its bounded upstream request could no longer be running.
    await db.update(auditLeads).set({ deliveryStatus: "PENDING", updatedAt: now }).where(and(
      eq(auditLeads.id, data.requestId), eq(auditLeads.deliveryStatus, "PROCESSING"),
      lt(auditLeads.updatedAt, new Date(Date.now() - 60000).toISOString()),
    ));

    const [lead] = await db.select().from(auditLeads).where(eq(auditLeads.id, data.requestId)).limit(1);
    if (!lead || lead.email !== data.email || lead.name !== data.name || lead.brokerage !== data.brokerage) return json({ ok: false, message: "Please refresh this page and try submitting again." }, 409);
    if (lead.deliveryStatus === "CONFIRMED") return json({ ok: true }, 200);

    // Retries always use the original saved request, so a retry cannot silently change a confirmed notification.
    const savedData = {
      ...data, name: lead.name, brokerage: lead.brokerage, email: lead.email, profile: lead.profile,
      role: lead.role, volume: lead.volume, challenge: lead.challenge,
      countryCode: "", whatsapp: lead.whatsapp, whatsappConsent: lead.whatsappConsent,
      attribution: lead.attribution as typeof data.attribution,
    };
    if (!lead.contactConfirmedAt) {
      // Claim notification processing atomically. This prevents simultaneous requests with one key notifying twice.
      const [claimed] = await db.update(auditLeads).set({ deliveryStatus: "PROCESSING", updatedAt: now })
        .where(and(eq(auditLeads.id, data.requestId), eq(auditLeads.deliveryStatus, "PENDING"))).returning({ id: auditLeads.id });
      if (!claimed) return json({ ok: false, message: "Your request is being confirmed. Please wait a moment and try again." }, 409);
      try {
        // The saved phone is already international; the empty countryCode preserves that exact number.
        await notifyAuditTeam(savedData);
        await db.update(auditLeads).set({ contactConfirmedAt: new Date().toISOString(), deliveryStatus: "NOTIFIED", updatedAt: new Date().toISOString() }).where(eq(auditLeads.id, data.requestId));
      } catch {
        await db.update(auditLeads).set({ deliveryStatus: "PENDING", updatedAt: new Date().toISOString() }).where(eq(auditLeads.id, data.requestId));
        return json({ ok: false, message: "We saved your details but couldn’t confirm delivery to our team. Please try again shortly." }, 502);
      }
    }
    const acknowledgementId = lead.acknowledgementId || await optionalAcknowledgement(savedData, config);
    await db.update(auditLeads).set({ acknowledgementId, deliveryStatus: "CONFIRMED", updatedAt: new Date().toISOString() }).where(eq(auditLeads.id, data.requestId));
    return json({ ok: true }, 200);
  } catch {
    // Never log personal form details or upstream response bodies.
    return json({ ok: false, message: "We couldn’t confirm your audit request. Your details are still in the form; please try again shortly." }, 503);
  }
}

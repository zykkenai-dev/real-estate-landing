import { consentedPhone, contactMessage, type AuditRequest } from "./audit-validation";

export type AuditDeliveryConfig = {
  AUDIT_CONTACT_ENABLED?: string;
  RESEND_API_KEY?: string;
  AUDIT_FROM_EMAIL?: string;
};

export function deliveryConfigured(config: AuditDeliveryConfig) {
  return config.AUDIT_CONTACT_ENABLED === "true" && Boolean(config.RESEND_API_KEY?.trim()) && Boolean(config.AUDIT_FROM_EMAIL?.trim());
}

export async function notifyAuditTeam(data: AuditRequest, send: typeof fetch = fetch) {
  const response = await send("https://www.zykken.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": data.requestId },
    body: JSON.stringify({
      name: data.name, email: data.email, phone: consentedPhone(data), need: "crm",
      message: contactMessage(data), company_site: "",
    }),
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json() as { ok?: boolean };
  if (!response.ok || result.ok !== true) throw new Error("Audit notification was not confirmed");
}

export async function acknowledgeAudit(data: AuditRequest, config: AuditDeliveryConfig, send: typeof fetch = fetch) {
  const firstName = data.name.split(/\s+/)[0];
  const response = await send("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", "Authorization": `Bearer ${config.RESEND_API_KEY}`,
      "Idempotency-Key": `audit-acknowledgement/${data.requestId}`,
    },
    body: JSON.stringify({
      from: config.AUDIT_FROM_EMAIL, to: [data.email],
      subject: "Your Zykken lead audit request is confirmed",
      text: `Hi ${firstName},\n\nThanks for requesting a Lead Conversion Audit for ${data.brokerage}.\nWe’ve received your details and will review the enquiry journey using the information you shared.\n\nIn the meantime, here are three useful things to check: how quickly your team responds, how consistently it follows up, and whether each enquiry has a visible next step.\n\nWe’ll be in touch about the audit.\n\nZykken`,
    }),
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json() as { id?: string };
  if (!response.ok || typeof result.id !== "string" || !result.id) throw new Error("Audit acknowledgement was not confirmed");
  return result.id;
}

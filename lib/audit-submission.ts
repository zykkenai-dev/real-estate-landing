import { attributionKeys, consentedPhone, type AuditRequest } from "./audit-validation";

const ttl = 10 * 60 * 1000;
const maximumSubmissions = 512;
const maximumConnections = 2048;
const requestsPerWindow = 5;

export type AuditSubmissionResult =
  | { ok: true }
  | { ok: false; status: 409; message: string };

type Submission = {
  fingerprint: Promise<string>;
  expiresAt: number;
  completed: boolean;
  result: Promise<AuditSubmissionResult>;
};
type Connection = { count: number; expiresAt: number };

// Best-effort protection within this process only. These bounded caches are not
// shared across serverless instances, survive neither restarts nor eviction,
// and do not replace durable rate limits or provider-side idempotency.
// Completed submissions retain only their ID, digest, timestamps and outcome;
// no name, email, phone, IP address or other raw form values are cached.
const submissions = new Map<string, Submission>();
const connections = new Map<string, Connection>();

function prune<T extends { expiresAt: number }>(cache: Map<string, T>, now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

function clean(value: string) {
  return value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
}

async function fingerprint(data: AuditRequest) {
  return digest(JSON.stringify({
    name: clean(data.name), brokerage: clean(data.brokerage), email: clean(data.email).toLowerCase(),
    profile: clean(data.profile), role: clean(data.role), volume: clean(data.volume), challenge: clean(data.challenge),
    whatsapp: consentedPhone(data), whatsappConsent: data.whatsappConsent,
    company_site: clean(data.company_site),
    attribution: Object.fromEntries(attributionKeys.map(key => [key, clean(data.attribution[key] || "")])),
  }));
}

/** Coalesce matching request IDs for ten minutes. Failed deliveries remain retryable. */
export async function submitAuditOnce(
  data: AuditRequest,
  deliver: (data: AuditRequest) => Promise<unknown>,
  now = Date.now(),
): Promise<AuditSubmissionResult> {
  prune(submissions, now);
  const previous = submissions.get(data.requestId);
  if (previous) {
    const [previousFingerprint, payloadFingerprint] = await Promise.all([previous.fingerprint, fingerprint(data)]);
    if (previousFingerprint !== payloadFingerprint) {
      return { ok: false, status: 409, message: "This request reference was already used for different details. Please refresh the page and try again." };
    }
    return previous.result;
  }

  if (submissions.size >= maximumSubmissions) {
    // Never discard an active claim to make room for a new request.
    const completed = Array.from(submissions).find(([, entry]) => entry.completed);
    if (completed) submissions.delete(completed[0]);
    else return { ok: false, status: 409, message: "Several requests are being confirmed. Please wait a moment and try again." };
  }

  const payloadFingerprint = fingerprint(data);
  const entry: Submission = {
    fingerprint: payloadFingerprint, expiresAt: now + ttl, completed: false,
    result: Promise.resolve({ ok: true }),
  };
  entry.result = payloadFingerprint.then(() => deliver(data)).then(
    (): AuditSubmissionResult => {
      entry.completed = true;
      return { ok: true };
    },
    (error: unknown) => {
      if (submissions.get(data.requestId) === entry) submissions.delete(data.requestId);
      throw error;
    },
  );
  submissions.set(data.requestId, entry);
  return entry.result;
}

/**
 * Return zero when allowed, otherwise Retry-After seconds. The caller must supply
 * only a platform-verified client IP; undefined or empty input skips throttling.
 */
export async function allowAuditSubmission(ip: string | undefined, now = Date.now()): Promise<number> {
  const address = ip?.trim().toLowerCase();
  if (!address) return 0;
  const expiresAt = (Math.floor(now / ttl) + 1) * ttl;
  const key = await digest(`${Math.floor(now / ttl)}:${address}`);
  prune(connections, now);
  let connection = connections.get(key);
  if (!connection) {
    if (connections.size >= maximumConnections) return Math.max(1, Math.ceil((expiresAt - now) / 1000));
    connection = { count: 0, expiresAt };
    connections.set(key, connection);
  }
  if (connection.count >= requestsPerWindow) return Math.max(1, Math.ceil((connection.expiresAt - now) / 1000));
  connection.count += 1;
  return 0;
}

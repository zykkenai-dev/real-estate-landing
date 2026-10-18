import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Use the exact production TypeScript helpers without adding a test runtime dependency.
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const validationUrl = asModule(compile(await readFile(new URL("../lib/audit-validation.ts", import.meta.url), "utf8")));
const { initialAuditValues, parseAuditRequest, validateAudit, contactMessage, consentedPhone, qualification } = await import(validationUrl);
const deliverySource = compile(await readFile(new URL("../lib/audit-delivery.ts", import.meta.url), "utf8")).replace('"./audit-validation"', JSON.stringify(validationUrl));
const { acknowledgeAudit, notifyAuditTeam, deliveryConfigured } = await import(asModule(deliverySource));

function validRequest(overrides = {}) {
  return {
    ...initialAuditValues(), name: "Sam Example", brokerage: "Example Brokerage", email: "SAM@EXAMPLE.COM",
    profile: "example.com", role: "Owner / Founder", volume: "31-100", challenge: "Following up consistently",
    requestId: "c7c9e93d-fd31-46c1-a847-5f97af3a93ab", company_site: "",
    attribution: { utm_source: "test", utm_medium: "", utm_campaign: "", utm_content: "", ad_id: "" },
    ...overrides,
  };
}

test("step one accepts only the core fields and reports inline required errors", () => {
  assert.deepEqual(Object.keys(validateAudit(initialAuditValues(), 1)), ["name", "brokerage", "email"]);
  assert.deepEqual(validateAudit(validRequest({ role: "", volume: "", challenge: "" }), 1), {});
  assert.deepEqual(Object.keys(validateAudit(validRequest({ role: "", volume: "", challenge: "" }), 2)), ["role", "volume", "challenge"]);
});

test("server rejects malformed requests and selections outside the supplied options", () => {
  assert.equal(parseAuditRequest(null).invalid, true);
  assert.equal(parseAuditRequest(validRequest({ requestId: "invented" })).invalid, true);
  assert.equal(parseAuditRequest(validRequest({ whatsappConsent: "true" })).invalid, true);
  assert.match(parseAuditRequest(validRequest({ role: "Property buyer" })).errors.role, /Choose/);
  assert.match(parseAuditRequest(validRequest({ email: "invalid@" })).errors.email, /email/);
  assert.match(parseAuditRequest(validRequest({ name: "x".repeat(101) })).errors.name, /full name/);
});

test("profiles accept public websites and Instagram handles, reject invalid or unsafe schemes", () => {
  for (const profile of ["example.com", "https://example.com/contact", "https://instagram.com/example", "@example.uae", ""]) {
    assert.equal(validateAudit(validRequest({ profile }), 1).profile, undefined, profile);
  }
  for (const profile of ["not a website", "javascript:alert(1)", "ftp://example.com", "https://user:password@example.com"]) {
    assert.ok(validateAudit(validRequest({ profile }), 1).profile, profile);
  }
});

test("WhatsApp is never persisted or forwarded without explicit boolean consent", () => {
  const { data } = parseAuditRequest(validRequest({ whatsapp: "501234567", whatsappConsent: false }));
  assert.equal(data.whatsapp, "");
  assert.equal(consentedPhone(data), "");
  const { data: optedIn } = parseAuditRequest(validRequest({ whatsapp: "050 123 4567", whatsappConsent: true }));
  assert.equal(consentedPhone(optedIn), "+971501234567");
  assert.ok(validateAudit(validRequest({ whatsapp: "abc", whatsappConsent: true }), 2).whatsapp);
});

test("normalizes email and bounds attribution without accepting unexpected tracking values", () => {
  const { data } = parseAuditRequest(validRequest({ attribution: { utm_source: "x".repeat(500), email: "secret@example.com" } }));
  assert.equal(data.email, "sam@example.com");
  assert.equal(data.attribution.utm_source.length, 120);
  assert.equal(data.attribution.email, undefined);
  assert.ok(contactMessage(data).length <= 1200);
  assert.match(contactMessage(data), /c7c9e93d-fd31-46c1-a847-5f97af3a93ab/);
});

test("priority is a heuristic and accepts low-volume legitimate requests", () => {
  assert.equal(qualification(validRequest()), "high");
  assert.equal(qualification(validRequest({ role: "Team Lead", volume: "11-30" })), "medium");
  assert.equal(qualification(validRequest({ role: "Agent", volume: "0-10" })), "low");
  assert.ok(parseAuditRequest(validRequest({ role: "Agent", volume: "0-10" })).data);
});

test("delivery stays disabled until forwarding and acknowledgement credentials are configured", () => {
  assert.equal(deliveryConfigured({}), false);
  assert.equal(deliveryConfigured({ AUDIT_CONTACT_ENABLED: "false", RESEND_API_KEY: "test", AUDIT_FROM_EMAIL: "audit@example.com" }), false);
  assert.equal(deliveryConfigured({ AUDIT_CONTACT_ENABLED: "true", RESEND_API_KEY: "test", AUDIT_FROM_EMAIL: "audit@example.com" }), true);
});

test("team forwarding requires an affirmative upstream result and sends only consented phone", async () => {
  const data = parseAuditRequest(validRequest({ whatsapp: "501234567" })).data;
  let sent;
  await notifyAuditTeam(data, async (url, options) => {
    assert.equal(url, "https://www.zykken.com/api/contact");
    sent = JSON.parse(options.body);
    return Response.json({ ok: true });
  });
  assert.equal(sent.phone, "");
  assert.equal(sent.need, "crm");
  assert.equal(sent.company_site, "");
  assert.ok(sent.message.length <= 1200);
  await assert.rejects(notifyAuditTeam(data, async () => Response.json({ ok: false })), /not confirmed/);
  await assert.rejects(notifyAuditTeam(data, async () => Response.json({ ok: true }, { status: 500 })), /not confirmed/);
});

test("acknowledgement requires the provider message ID and uses a stable idempotency key", async () => {
  const data = parseAuditRequest(validRequest()).data;
  let sent;
  const messageId = await acknowledgeAudit(data, { RESEND_API_KEY: "not-a-real-key", AUDIT_FROM_EMAIL: "audit@example.com" }, async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], `audit-acknowledgement/${data.requestId}`);
    sent = JSON.parse(options.body);
    return Response.json({ id: "provider-message-id" });
  });
  assert.equal(messageId, "provider-message-id");
  assert.deepEqual(sent.to, ["sam@example.com"]);
  assert.equal(sent.subject, "Your Zykken lead audit request is confirmed");
  assert.match(sent.text, /Hi Sam,/);
  assert.doesNotMatch(sent.text, /business day/);
  await assert.rejects(acknowledgeAudit(data, {}, async () => Response.json({})), /not confirmed/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Exercise the production POST and delivery code. Only the unused D1 imports
// are replaced; every outbound request is mocked before the handler runs.
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const sourceAt = path => readFile(new URL(path, import.meta.url), "utf8");
const validationUrl = asModule(compile(await sourceAt("../lib/audit-validation.ts")));
const deliveryUrl = asModule(compile(await sourceAt("../lib/audit-delivery.ts"))
  .replace('"./audit-validation"', JSON.stringify(validationUrl)));
const runtimeUrl = asModule(compile(await sourceAt("../lib/audit-runtime.ts")));
const originUrl = asModule(compile(await sourceAt("../lib/audit-origin.ts")));
const submissionUrl = asModule(compile(await sourceAt("../lib/audit-submission.ts"))
  .replace('"./audit-validation"', JSON.stringify(validationUrl)));
const unusedDatabaseUrl = asModule(`
  export function getDb() { throw new Error("No-DB requests must not access D1"); }
  export function and() { throw new Error("No-DB requests must not build D1 queries"); }
  export const eq = and, lt = and, sql = and;
  export const auditLeads = {}, auditRateLimits = {};
`);
const replacements = new Map([
  ["drizzle-orm", unusedDatabaseUrl],
  ["@/db", unusedDatabaseUrl],
  ["@/db/schema", unusedDatabaseUrl],
  ["@/lib/audit-delivery", deliveryUrl],
  ["@/lib/audit-runtime", runtimeUrl],
  ["@/lib/audit-submission", submissionUrl],
  ["@/lib/audit-origin", originUrl],
  ["@/lib/audit-validation", validationUrl],
]);
let routeSource = compile(await sourceAt("../app/api/audit/route.ts"));
for (const [specifier, replacement] of replacements) {
  assert.ok(routeSource.includes(JSON.stringify(specifier)), `Expected route import: ${specifier}`);
  routeSource = routeSource.replace(JSON.stringify(specifier), JSON.stringify(replacement));
}
const { POST } = await import(asModule(routeSource));
const { runWithAuditRuntime } = await import(runtimeUrl);
const websiteEndpoint = "https://www.zykken.com/api/contact";
let requestNumber = 0;

function validRequest(overrides = {}) {
  return {
    name: "Sam Example", brokerage: "Example Brokerage", email: "SAM@EXAMPLE.COM",
    profile: "https://example.com", role: "Owner / Founder", volume: "31-100",
    challenge: "Following up consistently", countryCode: "+971", whatsapp: "050 123 4567",
    whatsappConsent: true, requestId: `${(++requestNumber).toString(16).padStart(8, "0")}-fd31-46c1-a847-5f97af3a93ab`, company_site: "",
    attribution: {
      utm_source: "meta", utm_medium: "paid-social", utm_campaign: "uae-audit",
      utm_content: "enquiry-journey", ad_id: "example-ad-123",
    },
    ...overrides,
  };
}

function requestFor(payload = validRequest(), { headers = {}, rawBody } = {}) {
  return new Request("https://audit.example/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Host: "audit.example", Origin: "https://audit.example", ...headers },
    body: rawBody ?? JSON.stringify(payload),
  });
}

const invoke = (request = requestFor(), config = {}) => runWithAuditRuntime(config, () => POST(request));

test("no-DB submissions wait for website acceptance and forward every audit field", async t => {
  const data = validRequest();
  let accept;
  let notifyStarted;
  let finished = false;
  const started = new Promise(resolve => { notifyStarted = resolve; });
  const accepted = new Promise(resolve => { accept = resolve; });
  const calls = [];
  t.mock.method(globalThis, "fetch", (url, options) => {
    calls.push({ url, options });
    notifyStarted();
    return accepted;
  });

  const pending = invoke(requestFor(data)).then(response => { finished = true; return response; });
  await started;
  assert.equal(finished, false, "Success must wait for the website's affirmative response");
  assert.equal(calls.length, 1, "No separate acknowledgement credentials are needed");
  const { url, options } = calls[0];
  assert.equal(url, websiteEndpoint);
  assert.equal(options.method, "POST");
  assert.equal(options.headers["Content-Type"], "application/json");
  assert.equal(options.headers["Idempotency-Key"], data.requestId);
  assert.equal(options.headers.Authorization, undefined, "Website credentials stay on its server");
  const sent = JSON.parse(options.body);
  assert.deepEqual(Object.keys(sent).sort(), ["company_site", "email", "message", "name", "need", "phone"]);
  assert.equal(sent.name, "Sam Example");
  assert.equal(sent.email, "sam@example.com");
  assert.equal(sent.phone, "+971501234567");
  assert.equal(sent.need, "crm");
  assert.equal(sent.company_site, "");
  for (const detail of [
    "Free UAE real estate Lead Conversion Audit request.",
    `Request reference: ${data.requestId}`, "Brokerage: Example Brokerage",
    "Profile: https://example.com", "Role: Owner / Founder", "Monthly property enquiries: 31-100",
    "Biggest challenge: Following up consistently", "WhatsApp contact consent: Yes",
    "utm_source: meta", "utm_medium: paid-social", "utm_campaign: uae-audit",
    "utm_content: enquiry-journey", "ad_id: example-ad-123",
  ]) assert.ok(sent.message.includes(detail), `Missing forwarded detail: ${detail}`);
  assert.ok(sent.message.length <= 1200, "Stay within the shared contact service's message limit");

  accept(Response.json({ ok: true }));
  const response = await pending;
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true });
});

test("matching no-DB submissions send once and reused IDs with different details fail", async t => {
  const data = validRequest();
  const outgoing = t.mock.method(globalThis, "fetch", async url => {
    assert.equal(url, websiteEndpoint);
    return Response.json({ ok: true });
  });
  const responses = await Promise.all([invoke(requestFor(data)), invoke(requestFor(data))]);
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  assert.equal((await invoke(requestFor(data))).status, 200);
  assert.equal(outgoing.mock.callCount(), 1);
  const mismatch = await invoke(requestFor({ ...data, brokerage: "Another Brokerage" }));
  assert.equal(mismatch.status, 409);
  assert.equal((await mismatch.json()).ok, false);
  assert.equal(outgoing.mock.callCount(), 1);
});

test("no-DB requests never forward a WhatsApp number without consent", async t => {
  let sent;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, websiteEndpoint);
    sent = JSON.parse(options.body);
    return Response.json({ ok: true });
  });
  const response = await invoke(requestFor(validRequest({ whatsappConsent: false })));
  assert.equal(response.status, 200);
  assert.equal(sent.phone, "");
  assert.match(sent.message, /WhatsApp contact consent: No/);
  assert.doesNotMatch(sent.message, /501234567/);
});

test("no-DB website rejection, malformed replies and transport failure never report success", async t => {
  const cases = [
    ["explicit refusal", () => Response.json({ ok: false })],
    ["HTTP failure even with an affirmative body", () => Response.json({ ok: true }, { status: 503 })],
    ["missing confirmation", () => Response.json({})],
    ["non-boolean confirmation", () => Response.json({ ok: "true" })],
    ["invalid JSON", () => new Response("not JSON")],
    ["network failure", () => { throw new Error("Mock network failure"); }],
  ];
  for (const [name, result] of cases) {
    await t.test(name, async child => {
      const outgoing = child.mock.method(globalThis, "fetch", async url => {
        assert.equal(url, websiteEndpoint);
        return result();
      });
      const response = await invoke();
      assert.equal(response.status, 502);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.match(body.message, /info@zykken\.com/);
      assert.equal(outgoing.mock.callCount(), 1);
    });
  }
});

test("invalid, cross-origin, honeypot and oversized requests never contact mail services", async t => {
  const cases = [
    ["invalid email", () => requestFor(validRequest({ email: "invalid" })), 400],
    ["invalid role", () => requestFor(validRequest({ role: "Property buyer" })), 400],
    ["invalid request ID", () => requestFor(validRequest({ requestId: "invented" })), 400],
    ["invalid consented phone", () => requestFor(validRequest({ whatsapp: "abc" })), 400],
    ["cross-origin", () => requestFor(validRequest(), { headers: { Origin: "https://other.example" } }), 403],
    ["honeypot", () => requestFor(validRequest({ company_site: "spam.example" })), 400],
    ["wrong content type", () => requestFor(validRequest(), { headers: { "Content-Type": "text/plain" } }), 415],
    ["malformed JSON", () => requestFor(undefined, { rawBody: "{" }), 400],
    ["non-object JSON", () => requestFor(null), 400],
    ["oversized streamed body", () => requestFor(validRequest({ padding: "x".repeat(13000) })), 400],
  ];
  for (const [name, request, expectedStatus] of cases) {
    await t.test(name, async child => {
      const outgoing = child.mock.method(globalThis, "fetch", async () => {
        throw new Error("Rejected requests must not contact external services");
      });
      const response = await invoke(request());
      assert.equal(response.status, expectedStatus);
      assert.equal((await response.json()).ok, false);
      assert.equal(outgoing.mock.callCount(), 0);
    });
  }
});

test("an optional acknowledgement failure preserves confirmed website delivery", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    if (url === websiteEndpoint) return Response.json({ ok: true });
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(JSON.parse(options.body).from, "Zykken Website <website@zykken.com>");
    return Response.json({ error: "Mock provider refusal" }, { status: 503 });
  });
  const response = await invoke(requestFor(), {
    RESEND_API_KEY: "not-a-real-key", RESEND_FROM_EMAIL: "Zykken Website <website@zykken.com>",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(calls.map(call => call.url), [websiteEndpoint, "https://api.resend.com/emails"]);
});

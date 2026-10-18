import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const validationUrl = asModule(compile(await readFile(new URL("../lib/audit-validation.ts", import.meta.url), "utf8")));
const compiled = compile(await readFile(new URL("../lib/audit-submission.ts", import.meta.url), "utf8"))
  .replace('"./audit-validation"', JSON.stringify(validationUrl));
let instance = 0;
// Each test gets a fresh process-local cache without adding reset hooks to production.
const fresh = () => import(asModule(`${compiled}\n// Test cache instance ${++instance}`));

function request(overrides = {}) {
  return {
    name: "Sam Example", brokerage: "Example Brokerage", email: "sam@example.com", profile: "example.com",
    role: "Owner / Founder", volume: "31-100", challenge: "Following up consistently",
    countryCode: "+971", whatsapp: "050 123 4567", whatsappConsent: true,
    requestId: "c7c9e93d-fd31-46c1-a847-5f97af3a93ab", company_site: "",
    attribution: { utm_source: "meta", utm_medium: "paid", utm_campaign: "audit", utm_content: "journey", ad_id: "123" },
    ...overrides,
  };
}

test("concurrent matching requests share delivery and completed retries stay deduplicated", async () => {
  const { submitAuditOnce } = await fresh();
  let deliver;
  const waiting = new Promise(resolve => { deliver = resolve; });
  let started;
  const called = new Promise(resolve => { started = resolve; });
  let calls = 0;
  const send = async data => {
    assert.equal(data.email, "sam@example.com");
    calls += 1;
    started();
    await waiting;
  };
  const first = submitAuditOnce(request(), send, 1000);
  await called;
  const second = submitAuditOnce(request(), send, 1001);
  deliver();
  assert.deepEqual(await Promise.all([first, second]), [{ ok: true }, { ok: true }]);
  assert.deepEqual(await submitAuditOnce(request(), send, 2000), { ok: true });
  assert.equal(calls, 1);
});

test("a failed in-flight delivery rejects matching callers and allows a fresh retry", async () => {
  const { submitAuditOnce } = await fresh();
  const error = new Error("Mock provider failure");
  let rejectDelivery;
  const waiting = new Promise((resolve, reject) => { rejectDelivery = reject; });
  let started;
  const called = new Promise(resolve => { started = resolve; });
  let calls = 0;
  const send = async () => { calls += 1; started(); await waiting; };
  const first = submitAuditOnce(request(), send, 1000);
  await called;
  const second = submitAuditOnce(request(), send, 1001);
  rejectDelivery(error);
  const results = await Promise.allSettled([first, second]);
  for (const result of results) {
    assert.equal(result.status, "rejected");
    assert.equal(result.reason, error);
  }
  assert.equal(calls, 1);
  assert.deepEqual(await submitAuditOnce(request(), async () => { calls += 1; }, 2000), { ok: true });
  assert.equal(calls, 2);
});

test("reusing an active or successful ID for another payload returns409 without delivery", async () => {
  const { submitAuditOnce } = await fresh();
  let finish;
  const waiting = new Promise(resolve => { finish = resolve; });
  let started;
  const called = new Promise(resolve => { started = resolve; });
  let calls = 0;
  const send = async () => { calls += 1; started(); await waiting; };
  const first = submitAuditOnce(request(), send, 1000);
  await called;
  const active = await submitAuditOnce(request({ brokerage: "Another Brokerage" }), send, 1001);
  assert.equal(active.ok, false);
  assert.equal(active.status, 409);
  assert.match(active.message, /different details/);
  finish();
  await first;
  const completed = await submitAuditOnce(request({ email: "other@example.com" }), send, 1002);
  assert.equal(completed.status, 409);
  assert.equal(calls, 1);
});

test("normalizes harmless field, email and consented-phone differences before fingerprinting", async () => {
  const { submitAuditOnce } = await fresh();
  let calls = 0;
  const send = async () => { calls += 1; };
  await submitAuditOnce(request(), send, 1000);
  assert.deepEqual(await submitAuditOnce(request({
    name: " Sam Example ", email: " SAM@EXAMPLE.COM ", whatsapp: "501234567",
    attribution: { ad_id: "123", utm_content: "journey", utm_campaign: "audit", utm_medium: "paid", utm_source: "meta" },
  }), send, 2000), { ok: true });
  assert.equal(calls, 1);
});

test("expired successful claims can be delivered again after ten minutes", async () => {
  const { submitAuditOnce } = await fresh();
  let calls = 0;
  const send = async () => { calls += 1; };
  await submitAuditOnce(request(), send, 1000);
  await submitAuditOnce(request(), send, 600999);
  assert.equal(calls, 1);
  await submitAuditOnce(request(), send, 601000);
  assert.equal(calls, 2);
});

test("submission capacity preserves active claims and can evict completed claims", async () => {
  const { submitAuditOnce } = await fresh();
  let finish;
  const waiting = new Promise(resolve => { finish = resolve; });
  let calls = 0;
  const send = async () => { calls += 1; await waiting; };
  const withId = index => request({ requestId: `${index.toString(16).padStart(8, "0")}-fd31-46c1-a847-5f97af3a93ab` });
  const pending = Array.from({ length: 512 }, (_, index) => submitAuditOnce(withId(index), send, 1000));
  const overflow = await submitAuditOnce(withId(512), send, 1000);
  assert.equal(overflow.ok, false);
  assert.equal(overflow.status, 409);
  assert.match(overflow.message, /wait a moment/);
  finish();
  for (const result of await Promise.all(pending)) assert.deepEqual(result, { ok: true });
  assert.equal(calls, 512);
  assert.deepEqual(await submitAuditOnce(withId(512), send, 1001), { ok: true });
  assert.equal(calls, 513);
});

test("trusted-IP throttle allows five requests per ten-minute window and resets at expiry", async () => {
  const { allowAuditSubmission } = await fresh();
  for (let i = 0; i < 5; i += 1) assert.equal(await allowAuditSubmission("192.0.2.1", 120000), 0);
  assert.equal(await allowAuditSubmission("192.0.2.1", 120000), 480);
  assert.equal(await allowAuditSubmission("192.0.2.1", 599999), 1);
  assert.equal(await allowAuditSubmission("192.0.2.1", 600000), 0);
  assert.equal(await allowAuditSubmission("192.0.2.2", 120000), 0);
});

test("missing client IPs do not share a throttle bucket; normalized trusted IPv6 does", async () => {
  const { allowAuditSubmission } = await fresh();
  for (let i = 0; i < 12; i += 1) {
    assert.equal(await allowAuditSubmission(undefined, 1000), 0);
    assert.equal(await allowAuditSubmission(" ", 1000), 0);
  }
  for (let i = 0; i < 5; i += 1) assert.equal(await allowAuditSubmission(" 2001:DB8::1 ", 1000), 0);
  assert.equal(await allowAuditSubmission("2001:db8::1", 1000), 599);
});

test("IP throttle capacity stays bounded and expired windows release capacity", async () => {
  const { allowAuditSubmission } = await fresh();
  const results = await Promise.all(Array.from({ length: 2048 }, (_, index) =>
    allowAuditSubmission(`2001:db8::${index.toString(16)}`, 1000)));
  assert.ok(results.every(result => result === 0));
  assert.equal(await allowAuditSubmission("2001:db8:1::1", 1000), 599);
  assert.equal(await allowAuditSubmission("2001:db8::1", 1000), 0);
  assert.equal(await allowAuditSubmission("2001:db8:1::1", 600000), 0);
});

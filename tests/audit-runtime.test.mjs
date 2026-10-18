import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/audit-runtime.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getAuditRuntime, runWithAuditRuntime } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("Node runtime has no implicit Cloudflare database binding", () => {
  assert.equal(getAuditRuntime().DB, undefined);
});

test("overlapping Worker requests retain their own bindings across awaits", async () => {
  const first = { DB: {}, AUDIT_FROM_EMAIL: "first@example.com" };
  const second = { DB: {}, AUDIT_FROM_EMAIL: "second@example.com" };
  await Promise.all([first, second].map(config => runWithAuditRuntime(config, async () => {
    assert.equal(getAuditRuntime(), config);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(getAuditRuntime(), config);
  })));
  assert.equal(getAuditRuntime().DB, undefined);
});

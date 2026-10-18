import { AsyncLocalStorage } from "node:async_hooks";
import type { AuditDeliveryConfig } from "./audit-delivery";

type AuditRuntime = AuditDeliveryConfig & { DB?: D1Database };

// Worker bindings stay scoped to one request; Node builds never import Worker-only modules.
const runtime = new AsyncLocalStorage<AuditRuntime>();

export function runWithAuditRuntime<T>(config: AuditRuntime, run: () => T): T {
  return runtime.run(config, run);
}

export function getAuditRuntime(): AuditRuntime {
  return runtime.getStore() ?? {
    AUDIT_CONTACT_ENABLED: process.env.AUDIT_CONTACT_ENABLED,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUDIT_FROM_EMAIL: process.env.AUDIT_FROM_EMAIL,
  };
}

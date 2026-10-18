import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const auditLeads = sqliteTable("audit_leads", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  name: text("name").notNull(),
  brokerage: text("brokerage").notNull(),
  email: text("email").notNull(),
  profile: text("profile").notNull().default(""),
  role: text("role").notNull(),
  volume: text("enquiry_volume").notNull(),
  challenge: text("challenge").notNull(),
  whatsapp: text("whatsapp").notNull().default(""),
  whatsappConsent: integer("whatsapp_consent", { mode: "boolean" }).notNull().default(false),
  attribution: text("attribution", { mode: "json" }).notNull(),
  priority: text("priority").notNull().default("low"),
  reviewStatus: text("review_status").notNull().default("NEW"),
  deliveryStatus: text("delivery_status").notNull().default("PENDING"),
  contactConfirmedAt: text("contact_confirmed_at"),
  acknowledgementId: text("acknowledgement_id"),
});

// Short-lived, hashed IP buckets only; personal form details never enter this table.
export const auditRateLimits = sqliteTable("audit_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
});

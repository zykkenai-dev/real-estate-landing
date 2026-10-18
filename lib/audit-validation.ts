export const roles = [
  "Owner / Founder",
  "Managing Director / Brokerage Manager",
  "Team Lead",
  "Agent",
  "Other",
] as const;

export const enquiryVolumes = ["0-10", "11-30", "31-100", "100+", "Not sure"] as const;

export const challenges = [
  "Responding to enquiries quickly",
  "Following up consistently",
  "Turning enquiries into viewings",
  "Tracking leads and agent ownership",
  "Not sure where the gap is",
] as const;

export const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ad_id"] as const;
export type AttributionKey = (typeof attributionKeys)[number];
export type Attribution = Record<AttributionKey, string>;

export type AuditValues = {
  name: string;
  brokerage: string;
  email: string;
  profile: string;
  role: string;
  volume: string;
  challenge: string;
  countryCode: string;
  whatsapp: string;
  whatsappConsent: boolean;
};

export type AuditErrors = Partial<Record<keyof AuditValues, string>>;
export type AuditRequest = AuditValues & {
  requestId: string;
  company_site: string;
  attribution: Attribution;
};

export function initialAuditValues(): AuditValues {
  return {
    name: "", brokerage: "", email: "", profile: "", role: "", volume: "", challenge: "",
    countryCode: "+971", whatsapp: "", whatsappConsent: false,
  };
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max + 1) : "";
}

export function validateAudit(values: AuditValues, step: 1 | 2 | "all" = "all"): AuditErrors {
  const errors: AuditErrors = {};
  if (step === 1 || step === "all") {
    if (values.name.trim().length < 2 || values.name.length > 100) errors.name = "Enter your full name (2–100 characters).";
    if (values.brokerage.trim().length < 2 || values.brokerage.length > 150) errors.brokerage = "Enter your brokerage’s name (2–150 characters).";
    if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = "Enter a valid work email address.";
    if (values.profile.trim()) {
      const profile = values.profile.trim();
      const isHandle = /^@[a-zA-Z0-9._]{1,30}$/.test(profile);
      try {
        const url = new URL(/^https?:\/\//i.test(profile) ? profile : `https://${profile}`);
        if (!isHandle && (profile.length > 250 || !["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password || /\s/.test(profile))) {
          errors.profile = "Enter a website, Instagram profile link, or @handle.";
        }
      } catch {
        if (!isHandle) errors.profile = "Enter a website, Instagram profile link, or @handle.";
      }
    }
  }
  if (step === 2 || step === "all") {
    if (!(roles as readonly string[]).includes(values.role)) errors.role = "Choose your role.";
    if (!(enquiryVolumes as readonly string[]).includes(values.volume)) errors.volume = "Choose your approximate enquiry volume.";
    if (!(challenges as readonly string[]).includes(values.challenge)) errors.challenge = "Choose your biggest lead-handling challenge.";
    if (values.whatsappConsent && values.whatsapp.trim()) {
      if (!/^\+\d{1,4}$/.test(values.countryCode)) errors.countryCode = "Choose a valid country code.";
      const digits = values.whatsapp.replace(/[\s()\-]/g, "");
      const full = `${values.countryCode}${digits.replace(/^0+/, "")}`;
      if (!/^\d{5,13}$/.test(digits) || !/^\+\d{7,15}$/.test(full)) errors.whatsapp = "Enter a valid WhatsApp number without the country code.";
    }
  }
  return errors;
}

export function parseAuditRequest(input: unknown): { data?: AuditRequest; errors?: AuditErrors; invalid?: boolean } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { invalid: true };
  const raw = input as Record<string, unknown>;
  if (typeof raw.whatsappConsent !== "boolean" || typeof raw.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.requestId)) return { invalid: true };
  const values: AuditValues = {
    name: clean(raw.name, 100), brokerage: clean(raw.brokerage, 150), email: clean(raw.email, 254).toLowerCase(),
    profile: clean(raw.profile, 250), role: clean(raw.role, 100), volume: clean(raw.volume, 30), challenge: clean(raw.challenge, 100),
    countryCode: clean(raw.countryCode, 5), whatsapp: raw.whatsappConsent ? clean(raw.whatsapp, 30) : "", whatsappConsent: raw.whatsappConsent,
  };
  const errors = validateAudit(values);
  if (Object.keys(errors).length) return { errors };
  const rawAttribution = raw.attribution && typeof raw.attribution === "object" ? raw.attribution as Record<string, unknown> : {};
  const attribution = Object.fromEntries(attributionKeys.map(key => [key, clean(rawAttribution[key], 120).slice(0, 120)])) as Attribution;
  return { data: { ...values, requestId: raw.requestId, company_site: clean(raw.company_site, 250), attribution } };
}

export function contactMessage(data: AuditRequest) {
  return [
    "Free UAE real estate Lead Conversion Audit request.",
    `Request reference: ${data.requestId}`,
    `Brokerage: ${data.brokerage}`,
    `Profile: ${data.profile || "Not supplied"}`,
    `Role: ${data.role}`,
    `Monthly property enquiries: ${data.volume}`,
    `Biggest challenge: ${data.challenge}`,
    `WhatsApp contact consent: ${data.whatsappConsent ? "Yes" : "No"}`,
    ...attributionKeys.filter(key => data.attribution[key]).map(key => `${key}: ${data.attribution[key]}`),
  ].join("\n").slice(0, 1200);
}

export function consentedPhone(data: AuditValues) {
  return data.whatsappConsent && data.whatsapp.trim()
    ? `${data.countryCode}${data.whatsapp.replace(/[\s()\-]/g, "").replace(/^0+/, "")}`
    : "";
}

export function qualification(data: AuditValues): "high" | "medium" | "low" {
  const manager = (roles.slice(0, 2) as readonly string[]).includes(data.role);
  if (manager && ["31-100", "100+"].includes(data.volume) && data.challenge !== challenges[4]) return "high";
  if ((manager || data.role === "Team Lead") && data.volume === "11-30") return "medium";
  return "low";
}

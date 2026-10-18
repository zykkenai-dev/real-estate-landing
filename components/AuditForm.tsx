"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LockKeyhole } from "lucide-react";
import {
  attributionKeys, challenges, enquiryVolumes, initialAuditValues, roles, validateAudit,
  type Attribution, type AuditErrors, type AuditValues,
} from "@/lib/audit-validation";

const countries = [
  ["+971", "UAE +971"], ["+966", "Saudi Arabia +966"], ["+974", "Qatar +974"],
  ["+965", "Kuwait +965"], ["+968", "Oman +968"], ["+973", "Bahrain +973"],
  ["+91", "India +91"], ["+44", "United Kingdom +44"], ["+1", "US / Canada +1"],
  ["+92", "Pakistan +92"], ["+20", "Egypt +20"], ["+962", "Jordan +962"],
  ["+961", "Lebanon +961"], ["+61", "Australia +61"], ["+27", "South Africa +27"],
  ["+63", "Philippines +63"], ["+880", "Bangladesh +880"], ["+49", "Germany +49"],
  ["+33", "France +33"], ["+7", "Russia / Kazakhstan +7"],
];

function track(event: "form_start" | "form_step1_complete" | "lead_submit_success") {
  window.dispatchEvent(new CustomEvent("zykken:analytics", { detail: { event } }));
}

export function ThankYou() {
  return (
    <section className="thank-you-screen" aria-labelledby="thank-you-heading">
      <div className="thank-you-inner">
        <div className="success-roundel" aria-hidden="true"><Check size={28} strokeWidth={1.7} /></div>
        <p className="eyebrow">YOUR NEXT STEP</p>
        <h1 id="thank-you-heading">Your audit request is in.</h1>
        <p>Thanks for sharing a little about your brokerage. We’ll review the details and contact you at the email address you provided.</p>
        <div className="thank-you-questions">
          <h2>While we review: three quick questions for your team</h2>
          <ol>
            <li>How long does it usually take to respond to a new property enquiry?</li>
            <li>Does every unanswered enquiry have a defined follow-up step?</li>
            <li>Can you tell which enquiries became viewings last month?</li>
          </ol>
          <p>If any answer is unclear, that’s a useful place to start investigating.</p>
        </div>
        <a className="button button-dark" href="https://www.zykken.com">Return to Zykken <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

export default function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<AuditValues>(initialAuditValues);
  const [errors, setErrors] = useState<AuditErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const attribution = useRef<Attribution>({ utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", ad_id: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const requestId = useRef("");
  const started = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    requestId.current = crypto.randomUUID();
    const params = new URLSearchParams(window.location.search);
    const next = Object.fromEntries(attributionKeys.map(key => [key, (params.get(key) || (key === "ad_id" ? params.get("adid") : "") || "").slice(0, 120)])) as Attribution;
    attribution.current = next;
    for (const key of attributionKeys) {
      const field = formRef.current?.querySelector<HTMLInputElement>(`[name="${key}"]`);
      if (field) field.value = next[key];
    }
  }, []);

  function update<K extends keyof AuditValues>(key: K, value: AuditValues[K]) {
    setValues(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setServerError("");
  }

  function focusError(nextErrors: AuditErrors) {
    requestAnimationFrame(() => {
      const key = Object.keys(nextErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${key}"]`)?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const nextErrors = validateAudit(values, step === 1 ? 1 : "all");
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) {
      if (step === 2 && ["name", "brokerage", "email", "profile"].some(key => key in nextErrors)) setStep(1);
      focusError(nextErrors);
      return;
    }
    if (step === 1) {
      track("form_step1_complete");
      setStep(2);
      requestAnimationFrame(() => titleRef.current?.focus());
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      const honeypot = formRef.current?.querySelector<HTMLInputElement>("[name=company_site]")?.value || "";
      const response = await fetch("/api/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, whatsapp: values.whatsappConsent ? values.whatsapp : "", requestId: requestId.current || crypto.randomUUID(), company_site: honeypot, attribution: attribution.current }),
      });
      const result = await response.json() as { ok?: boolean; errors?: AuditErrors; message?: string };
      if (!response.ok || result.ok !== true) {
        if (result.errors) {
          setErrors(result.errors);
          if (["name", "brokerage", "email", "profile"].some(key => key in result.errors!)) setStep(1);
          focusError(result.errors);
        }
        setServerError(result.message || "We couldn’t confirm your request. Your details are still here; please try again shortly.");
        return;
      }
      track("lead_submit_success");
      setSuccess(true);
      window.dispatchEvent(new CustomEvent("audit:success"));
      try { sessionStorage.setItem("zykken-audit-confirmed", "1"); } catch { return; /* Retain the server-confirmed in-page state when storage is disabled. */ }
      router.push("/uae-real-estate-audit/thank-you");
    } catch {
      setServerError("We couldn’t confirm your request. Your details are still here; please check your connection and try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  function errorAttributes(key: keyof AuditValues, help?: string) {
    return {
      "aria-invalid": errors[key] ? true : undefined,
      "aria-describedby": [help, errors[key] ? `audit-${key}-error` : ""].filter(Boolean).join(" ") || undefined,
    };
  }

  function error(key: keyof AuditValues) {
    return errors[key] ? <p className="field-error" id={`audit-${key}-error`} role="alert">{errors[key]}</p> : null;
  }

  if (success) return <ThankYou />;

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="step-indicator" aria-label={`Step ${step} of 2`}>
          <span>Step {step} of 2</span>
          <div className="step-dots" aria-hidden="true"><i className="active" /><i className={step === 2 ? "active" : ""} /></div>
        </div>
        <h3 ref={titleRef} tabIndex={-1}>Request your free audit</h3>
        <p>A few details help us make the review relevant.</p>
      </div>
      <form ref={formRef} onSubmit={submit} noValidate onFocusCapture={() => { if (!started.current) { started.current = true; track("form_start"); } }} aria-label="Free Lead Conversion Audit request">
        <div className="form-honeypot" aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor="audit-company-site">Leave this field empty</label>
          <input id="audit-company-site" name="company_site" tabIndex={-1} autoComplete="off" />
        </div>
        {attributionKeys.map(key => <input key={key} type="hidden" name={key} defaultValue="" />)}
        <p className="form-step-title">{step === 1 ? "Your brokerage" : "Your lead process"}</p>
        {step === 1 ? (
          <>
            <div className="field"><label htmlFor="audit-name">Full name <span aria-hidden="true">*</span></label>
              <input className="form-input" id="audit-name" name="name" autoComplete="name" placeholder="Your full name" required maxLength={100} value={values.name} onChange={event => update("name", event.target.value)} {...errorAttributes("name")} />{error("name")}</div>
            <div className="field"><label htmlFor="audit-brokerage">Brokerage name <span aria-hidden="true">*</span></label>
              <input className="form-input" id="audit-brokerage" name="brokerage" autoComplete="organization" placeholder="Your brokerage’s name" required maxLength={150} value={values.brokerage} onChange={event => update("brokerage", event.target.value)} {...errorAttributes("brokerage")} />{error("brokerage")}</div>
            <div className="field"><label htmlFor="audit-email">Work email <span aria-hidden="true">*</span></label>
              <input className="form-input" id="audit-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@yourbrokerage.com" required maxLength={254} value={values.email} onChange={event => update("email", event.target.value)} {...errorAttributes("email")} />{error("email")}</div>
            <div className="field"><label htmlFor="audit-profile">Brokerage website or Instagram <span className="optional">(optional)</span></label>
              <input className="form-input" id="audit-profile" name="profile" autoComplete="url" placeholder="Website or Instagram profile link" maxLength={250} value={values.profile} onChange={event => update("profile", event.target.value)} {...errorAttributes("profile", "audit-profile-help")} />
              <p className="field-help" id="audit-profile-help">We’ll use this to review the public enquiry experience.</p>{error("profile")}</div>
            <button className="button button-dark form-button" type="submit">Continue <ArrowRight size={18} aria-hidden="true" /></button>
            <p className="form-reassurance"><LockKeyhole size={13} aria-hidden="true" /> Free to request. No obligation.</p>
          </>
        ) : (
          <>
            <div className="field"><label htmlFor="audit-role">Your role <span aria-hidden="true">*</span></label>
              <select className="form-select" id="audit-role" name="role" required value={values.role} onChange={event => update("role", event.target.value)} {...errorAttributes("role")}><option value="">Select your role</option>{roles.map(role => <option key={role}>{role}</option>)}</select>{error("role")}</div>
            <div className="field"><label htmlFor="audit-volume">Approximate monthly property enquiries <span aria-hidden="true">*</span></label>
              <select className="form-select" id="audit-volume" name="volume" required value={values.volume} onChange={event => update("volume", event.target.value)} {...errorAttributes("volume")}><option value="">Select enquiry volume</option>{enquiryVolumes.map(volume => <option key={volume}>{volume}</option>)}</select>{error("volume")}</div>
            <div className="field"><label htmlFor="audit-challenge">Biggest challenge right now <span aria-hidden="true">*</span></label>
              <select className="form-select" id="audit-challenge" name="challenge" required value={values.challenge} onChange={event => update("challenge", event.target.value)} {...errorAttributes("challenge")}><option value="">Select your biggest challenge</option>{challenges.map(challenge => <option key={challenge}>{challenge}</option>)}</select>{error("challenge")}</div>
            <div className="field whatsapp-field">
              <p className="field-label">WhatsApp number <span className="optional">(optional)</span></p>
              <p className="field-help" id="audit-whatsapp-help">Only if you’d like us to contact you on WhatsApp.</p>
              <label className="consent-label" htmlFor="audit-whatsapp-consent"><input id="audit-whatsapp-consent" name="whatsappConsent" type="checkbox" checked={values.whatsappConsent} onChange={event => update("whatsappConsent", event.target.checked)} /> <span>You may contact me on WhatsApp about this audit.</span></label>
              {values.whatsappConsent && <div className="phone-fields">
                <div><label className="sr-only" htmlFor="audit-country-code">Country code</label><select className="form-select" id="audit-country-code" name="countryCode" autoComplete="tel-country-code" value={values.countryCode} onChange={event => update("countryCode", event.target.value)} {...errorAttributes("countryCode")}>{countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select>{error("countryCode")}</div>
                <div><label className="sr-only" htmlFor="audit-whatsapp">WhatsApp number without country code</label><input className="form-input" id="audit-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="50 123 4567" maxLength={30} value={values.whatsapp} onChange={event => update("whatsapp", event.target.value)} {...errorAttributes("whatsapp", "audit-whatsapp-help")} />{error("whatsapp")}</div>
              </div>}
            </div>
            <p className="form-privacy">By submitting, you agree that Zykken may use your details to prepare and deliver this audit and respond to your request. Read our <a href="https://www.zykken.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy<span className="sr-only"> (opens in a new tab)</span></a>.</p>
            {serverError && <p className="form-server-error" role="alert">{serverError}</p>}
            <div className="form-actions"><button className="form-back" type="button" disabled={loading} onClick={() => { setStep(1); setServerError(""); requestAnimationFrame(() => titleRef.current?.focus()); }}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
              <button className="button button-dark form-button" type="submit" disabled={loading} aria-busy={loading}>{loading ? <>Submitting… <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /></> : <>Request My Free Audit <ArrowRight size={18} aria-hidden="true" /></>}</button></div>
          </>
        )}
      </form>
    </div>
  );
}

# Zykken UAE Real Estate Lead Audit

A single-offer landing page built from the supplied audit blueprint. Uses Zykken’s official logo, self-hosted Urbanist and Instrument Serif fonts, warm off-white palette, and charcoal controls.

## Preview

Requires Node.js 24.x.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 5173
```

Routes: `/` and `/uae-real-estate-audit`. The confirmation route is `/uae-real-estate-audit/thank-you` and only displays after a server-confirmed form submission.

## Verification

```sh
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

## Deploy to Vercel

Import this repository with its root directory left at the repository root. The committed `vercel.json` selects Next.js, runs `npm run build`, and uses `.next` as the output directory. `npm run start` serves the production build locally.

The default scripts use Next.js, which produces the manifests Vercel requires. The original Cloudflare/Sites workflow remains available as `npm run dev:sites`, `npm run build:sites`, and `npm run start:sites`; its `dist` output is not a Vercel build.

## Audit requests → info@zykken.com

The audit form uses the main website’s existing `https://www.zykken.com/api/contact` mail service. That service sends to the fixed recipient **info@zykken.com**, uses the visitor’s email as Reply-To, and keeps the existing `RESEND_API_KEY` and `RESEND_FROM_EMAIL` credentials on the main website’s server. No additional mail credentials need to be copied into this landing page.

Every accepted submission includes the visitor’s name and email, brokerage, public profile, role, enquiry volume, challenge, request ID and campaign attribution. WhatsApp details are forwarded only after explicit consent. The enquiry message is labeled as a free Lead Conversion Audit request.

`POST /api/audit` validates same-origin JSON requests, form fields, the honeypot and request size before calling the shared service. It returns success only after the service confirms `ok: true`; the main website requires Resend acceptance and a provider message ID before returning that result. Rejected or timed-out delivery leaves entered values intact and offers an `info@zykken.com` email link. An HTTP acceptance is not an independent check of inbox placement.

On Sites, the D1 `DB` binding additionally stores lead records, rate limits and delivery state. Sites applies the included schema migration on deployment. For a local Sites database, run `npm run build:sites` and then apply `drizzle/0000_classy_jocasta.sql` with the starter’s local Wrangler D1 command. Vercel forwards directly through the shared mail service without requiring a Cloudflare binding.

Without D1, bounded process-local caches coalesce matching request IDs and limit a platform-verified IP to five attempts per ten minutes. These controls reset with a serverless instance and are not global or durable. The shared contact service does not currently forward the request ID to Resend, so the extra idempotency header alone does not guarantee deduplication across instances.

A separate visitor acknowledgement is optional. To enable it, configure server-only `RESEND_API_KEY` and `RESEND_FROM_EMAIL` through the landing host’s secret settings; the older `AUDIT_FROM_EMAIL` name is also supported. An absent or failed visitor acknowledgement does not invalidate an accepted inbox notification. Never add credentials to source control or browser code.

Automated delivery tests mock the mail service and do not send real enquiries. The main website’s existing inbox delivery was verified separately on October 11, 2026; this update reuses that service without changing its credentials or routing.

Optional WhatsApp details are collected only after explicit consent. Personal details never enter analytics events. Events queue locally in `window.dataLayer`; no third-party analytics or advertising scripts are installed.

## Brand and legal sources

- https://www.zykken.com
- https://www.zykken.com/privacy
- https://www.zykken.com/terms

Official graphics and fonts are under `public/assets`; font licenses are included there.

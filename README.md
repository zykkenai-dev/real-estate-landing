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
node --test tests/audit.test.mjs
node --test tests/audit-runtime.test.mjs
npm run build
```

## Deploy to Vercel

Import this repository with its root directory left at the repository root. The committed `vercel.json` selects Next.js, runs `npm run build`, and uses `.next` as the output directory. `npm run start` serves the production build locally.

The default scripts use Next.js, which produces the manifests Vercel requires. The original Cloudflare/Sites workflow remains available as `npm run dev:sites`, `npm run build:sites`, and `npm run start:sites`; its `dist` output is not a Vercel build.

## Activate lead delivery

The page is ready for review. Collection intentionally returns an honest unavailable error until the server is configured; it never displays a fake confirmation.

Set these runtime variables through the host’s secret settings:

- `AUDIT_CONTACT_ENABLED=true` after confirming use of Zykken’s existing contact service.
- `RESEND_API_KEY`: a real Resend key with access to the verified sending domain.
- `AUDIT_FROM_EMAIL`: a verified Zykken sender address.

Never add credentials to source control. On Sites, the D1 `DB` binding is declared in `.openai/hosting.json`; Sites applies the included schema migration on deployment. For a local Sites database, run `npm run build:sites` and then apply `drizzle/0000_classy_jocasta.sql` with the starter’s local Wrangler D1 command.

Vercel does not provide the Sites D1 binding. The landing page deploys without it, and the form returns HTTP 503 with the unavailable message. Enabling collection on Vercel requires connecting a compatible persistent database and adapting `lib/audit-runtime.ts` / `db/index.ts`, as well as setting the delivery variables above. Setting email credentials alone does not enable collection. No browser submission is treated as successful without persistence and confirmed delivery.

`POST /api/audit` validates fields, checks same-origin JSON requests, rate limits, stores the request privately, forwards to Zykken’s verified `https://www.zykken.com/api/contact` service, and sends the acknowledgement through Resend. A successful confirmation requires the lead record plus affirmative responses from both delivery services. External delivery has not been tested with live credentials. Tests use mocked providers and do not send messages.

Optional WhatsApp details are collected only after explicit consent. Personal details never enter analytics events. Events queue locally in `window.dataLayer`; no third-party analytics or advertising scripts are installed.

## Brand and legal sources

- https://www.zykken.com
- https://www.zykken.com/privacy
- https://www.zykken.com/terms

Official graphics and fonts are under `public/assets`; font licenses are included there.

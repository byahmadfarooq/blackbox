# Blackbox

A free, deterministic landing-page checker for B2B sites. Paste an address, get a ranked report, a shareable link, a score card image and a PDF. By Ahmad Farooq.

## How it works
- `lib/engine/safe-fetch.ts` fetches the page with SSRF protection: DNS is resolved and checked, the connection is pinned to the checked IP, redirects are re-validated, and size and time are capped.
- `lib/engine/facts.ts` reads the HTML into plain facts (headlines, buttons, proof, forms, weight, metadata).
- `lib/engine/rubric*.ts` holds 29 fixed checks in five areas (action 28, message 22, proof 22, speed 14, basics 14). Each returns pass, warn, fail, unknown or n/a, with evidence.
- `lib/engine/engine.ts` scores only what could be confirmed and reports coverage. No AI is involved, so the same page always gets the same score.
- Reports live inside signed links (`lib/share.ts`): compressed JSON plus an HMAC. No database.

## Security
- Set `REPORT_SECRET` (a long random string) in the host environment. Without it, links are signed with a public fallback and could be forged.
- Rate limits are in memory per instance. Move to Redis or Upstash if traffic grows.
- Security headers and a CSP are set in `next.config.ts`.

## Develop
```
npm install
npm test
npm run dev
```
On Windows machines where the native SWC binary fails, build with `npx next build --webpack`.

## Roadmap
- Render-based checks (sticky header, script-added content)
- Rescan and compare over time
- Shorter links through a small database
- Optional PageSpeed API key for real speed data

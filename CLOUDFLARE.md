# Time Duration Calculator Cloudflare deployment

- Production: https://timedurationcalculator.cc/
- Previous deployment hostname: https://howlong-7sh.pages.dev/
- Repository: https://github.com/garrison2025/howlong
- Branch: `main`; existing Git integration automatically deploys commits.
- Pages project: `howlong`; assigned domain `howlong-7sh.pages.dev`.
- Framework preset: None. Build: `npm test`. Output: `dist`. Root: repository root.
- Environment: `NODE_VERSION=22`, `SITE_URL=https://timedurationcalculator.cc`.
- All calculations run on device; no credentials, database or paid runtime infrastructure.
- `_headers`: self-only script/CSP, no camera/microphone/geolocation, no framing, nosniff. Static assets carry content version query strings.
- `_redirects`: explicit existing aliases; canonical URLs use HTTPS and trailing slashes.
- Missing pages use generated noindex `404.html` with an actual 404 response.

Before publishing: typecheck/test, review keyword/route nonregression and browser states. After publishing: run `npm run audit:production`, inspect the new baseline before accepting it, verify actual browser behavior and static asset versions. Build success alone is not acceptance. Revert the release commit through normal Git history and allow Pages to redeploy if the live task or indexing output regresses.

When a custom domain is purchased: connect and verify it first, change SITE_URL, redeploy, verify canonical/Sitemap and redirects, then configure the matching Search Console property. The owner supplied timedurationcalculator.cc and contact@timedurationcalculator.cc. This release connects the existing domain; it does not purchase a domain or claim GSC ownership.

## Custom domain migration — 2026-10-27

Keep the existing Pages project/repository and all 77 paths. Add the apex as a custom domain; retain mail-related DNS records. SITE_URL must match site.config.json. The old pages.dev redirect and optional www redirect are Cloudflare account/zone redirect rules, not _redirects domain rules (unsupported). Verify HTTPS and path/query preservation before recording completion. The application publishes a mailto link; it does not send test emails or prove mailbox delivery.

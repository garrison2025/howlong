# Owner-selected domain migration — October 27, 2026

The owner supplied the purchased domain timedurationcalculator.cc and public contact address contact@timedurationcalculator.cc, and authorized continuing the existing publication workflow.

## Source changes

- Site identity: Time Duration Calculator. Full-word, two-line wordmark retains the clock symbol and original colors; no calculator layout or calculation rules changed.
- Canonical origin: https://timedurationcalculator.cc. Build environment SITE_URL and site.config.json must agree. Canonical/OG URLs, WebSite/WebPage/breadcrumb entities, robots and Sitemap use the selected origin.
- Contact page exposes the exact address as a mailto link and visible text. Feedback template, calendar producer/file name and About references use the new identity. Existing internal storage keys remain stable. Email privacy wording explains use for responding to requests; no message is sent automatically.
- All 77 routes, original 83 + 17 keyword strings and their 64 primary targets are preserved. The generated coverage summary now reports 77 pages.
- Historical production baseline/evidence remains unchanged. Audit defaults now read the configured production origin.

## Checks actually completed before source publication

- PASS: npm run check.
- PASS: npm test, 39 groups. Migration assertions verify all 77 canonical/OG/WebSite origins and the exact contact address, alongside existing calculation, route, keyword, schema, motion and clock tests.
- PASS: Real local browser at 320, 390, 768 and 1280px: no horizontal document overflow, full header name does not overlap action buttons. Contact page displays the supplied address.
- Cloudflare account: existing howlong Pages project and garrison2025/howlong repository retained. Production SITE_URL changed from the pages.dev origin to https://timedurationcalculator.cc and saved.
- Apex custom domain: observed Active / SSL enabled. Before activation, the apex showed a parking page; Cloudflare replaced the two apex A records (54.149.79.189 and 34.216.117.25, Auto TTL) with CNAME @ → howlong-7sh.pages.dev. Mail records were not edited.
- PASS: HTTPS apex request returned the existing website before source publication. Post-publication source checks and redirects are recorded separately after deployment.

## Hosting follow-through

Complete www alias and permanent old-host redirects in Cloudflare, preserving paths/query strings. Domain-level redirects are not supported in Pages _redirects; use account/zone redirect rules. Do not mark them complete without live HTTP verification. Check new-domain content, contact link, assets, all routes, Sitemap and HTTP 404 after deployment.

Mailbox delivery, Search Console ownership/indexing and field Core Web Vitals remain unverified. No email is sent as part of this migration and no ranking claim is made.

# HowLong SEO/GEO release evidence — 2026-10-26

Production: https://howlong-7sh.pages.dev/ ; repository: garrison2025/howlong, main.
Pre-change commit: `c042bde338308286ec88f4b449121e5f35c6cfbc`.
Reference standard: [Website Starter Standard](https://github.com/chenmu2024/Website-Starter-Standard), reviewed 2026-10-26: README, AGENTS, DESIGN, TASTE-UI-PROTOCOL, IMPECCABLE-UI-QUALITY-GATE, SEO-GEO-QUALITY-GATE, project/release templates, QA-CHECKLIST and CLOUDFLARE. This release adapts their process; it does not vendor third-party skills or install scanners.

## L1 checks actually run

- PASS: `npm run check`.
- PASS: `npm test`: 22 groups, including 72-page raw-HTML metadata, single H1, canonical, labels, internal links/orphans, asset version markers, Sitemap, 404, keyword map and matching visible/JSON-LD breadcrumb hierarchy.
- PASS: 83 original + 17 supplemental exact keyword strings; 64 original-keyword target routes and 72 total routes retained. No route/keyword data files changed.
- PASS: JSON-LD parse and deterministic relationship checks on every generated page. Stable WebSite/WebPage IDs and truthful BreadcrumbList; no invented author, company, review, offer or FAQ eligibility claim.
- PASS: fixed answers/table data stay in initial HTML even when native details are closed; no CSS/JS repair needed for title/canonical/robots/schema.
- PASS source review: relevant IANA, USNO, OPM and BIPM reference links added to appropriate methods; calculation conventions kept separate from sourced facts.

## L2 sampling

Raw-HTML/functional samples: explicit clock, ambiguous AM/PM, fixed duration, calendar month, business day, year range, holiday and century definition. They expose genuinely distinct inputs/outputs/examples, not separate pages for every synonym. No new pages or AI-only content. Browser evidence and five viewport review: `UI-RELEASE-EVIDENCE.md`.

Actual primary sources consulted: Google breadcrumb guidance; IANA time-zone database explanation; USNO Gregorian calendar/leap-year guide; OPM federal holiday dates; BIPM SI Brochure publication page. Checked 2026-10-26. Source/refresh rules: `SEO-GEO-PROJECT-BRIEF.md`. No Google rich-result or ranking guarantee is made.

## Production and drift

PENDING release verification. The pre-change live crawl covered all 72 routes, canonical/robots, links/orphans, 72 Sitemap entries and true 404. Its raw metadata/schema/link/content fingerprints were saved to the delivery workspace `work/howlong-standard-before.json`.

After publication run `npm run audit:production` to save `docs/production-baseline.json`, compare all route/title/description/H1/canonical/robots values and the keyword hash to the pre-change crawl, and verify the new schema and actual browser flow. Document the exact functional release SHA in this section once created. Changes in content fingerprints are expected for breadcrumbs/reference additions; approved search destination ownership must not change.

Performance lab: NOT RUN (PageSpeed public request failed to connect). GSC ownership, submitted/indexed counts, query/click/AI-search reports and CrUX field data: UNAVAILABLE, not passed. No international/hreflang applies. Training crawler policy unchanged; no special AI-only file added. Missing measurements are explicit limitations, not claims of full L2 certification.

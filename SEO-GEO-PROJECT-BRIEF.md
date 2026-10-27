# HowLong search architecture

Reviewed 2026-10-26. Existing-site alignment with [Website Starter Standard](https://github.com/chenmu2024/Website-Starter-Standard); approved V2 intent map retained.

## Identity, audience and protected scope

HowLong, https://howlong-7sh.pages.dev/, English, practical time/date tools. Research focuses on US English; device-local time zones remain selectable worldwide. No additional language/region URLs or hreflang are warranted. Static hosting, no runtime API/database, no new paid service. Revenue analysis excluded by owner.

The owner supplied the 83-row CSV dated 2026-10-25 and eight Semrush screenshots. Original CSV country was not specified; screenshots explicitly show US desktop. Numeric metrics remain in owner research files, never inferred from synonyms or presented as live traffic. `data/keywords.json` preserves every exact approved string and primary route; `docs/keyword-coverage.md` is the complete intent/route inventory. This release does not replace or expand that set.

## Route and index policy

| Template | Main destination / hub | Value and index policy |
|---|---|---|
| Clock + AM/PM disambiguation | `/how-long-until/` | Specific target, editable zone/day/time, distinct dual output where ambiguous; self-canonical |
| Fixed durations and calendar months | `/time-duration-converter/` | Exact preset answer, live conversion, defined units and month-end behavior; self-canonical |
| Business days | `/business-days-calculator/` | Signed counts, ranges, explicit weekend/exclusion rules and skipped-date table; self-canonical |
| Years | `/years-ago-calculator/` | Year/month endpoint ranges or exact date, visible reference date; self-canonical |
| Holidays | `/holiday-countdown/` | Halloween/US Thanksgiving with stated local-midnight conventions; self-canonical |
| Definitions | Existing fortnight/century pages | Direct definition, calendar operation and examples; self-canonical |
| Home, hubs, support/legal | Existing routes | Crawlable navigation and truthful methods/identity; self-canonical |
| Missing route | None | HTTP 404 + noindex, excluded from Sitemap |

72 canonical pages, 64 keyword targets. All canonical destinations appear in the generated Sitemap and real anchor navigation. No arbitrary generated parameter pages; settings use state/URL fragments. Query strings do not change the static task or canonical. Legacy aliases redirect once to the matching canonical task. HTTPS and trailing slash handled by Pages/explicit redirects. Sitemap omits fabricated lastmod.

## Entity, answer and schema model

The visible brand and `WebSite` entity are HowLong (`/#website`). Each `WebPage` points to it and uses its actual canonical URL. `BreadcrumbList` describes visible Home → parent hub (when distinct) → current task. No invented Organization identity, author credentials, rating, FAQ rich-result claim or unsupported SoftwareApplication offer.

Raw HTML contains fixed answers, labels, methods, links, metadata and JSON-LD. Live countdown values are generated on device, not stale server values. Unit tables remain in HTML inside a native expandable detail. No separate AI answer pages or llms.txt requirement. Search/training crawler rules remain unchanged; no new claim of training exclusion or AI ranking.

## Evidence/source registry

| Source | Supported claim | Checked | Refresh / fallback |
|---|---|---|---|
| https://www.iana.org/time-zones | Time-zone history and changes supplied through software/browser data | 2026-10-26 | Recheck on timezone changes; retain device-data limitation; no promise of latest database version |
| https://aa.usno.navy.mil/faq/calendars | Gregorian leap-year rules | 2026-10-26 | Recheck when calendar methods change; keep tested Gregorian implementation |
| https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/ | US Thanksgiving dates | 2026-10-26 | Recheck before yearly holiday review; retain fourth-Thursday test and midnight convention |
| https://www.bipm.org/en/publications/si-brochure | Time-unit reference | 2026-10-26 | Recheck on unit/reference revisions; exact arithmetic remains explicit |
| `src/core.ts`, tests, visible method notes | Month-end clamping, business exclusions, target conventions | Each code release | Internal product conventions, not attributed to external authorities |
| https://developers.google.com/search/docs/appearance/structured-data/breadcrumb | Breadcrumb property/structure guidance | 2026-10-26 | Recheck on schema changes; no rich-result guarantee |

Original value comes from working local calculators, distinct presets, reproducible examples and explicit boundary handling. Generated sibling pages are sampled by template; do not pad them to word counts. Stop expansion if task differentiation or coverage checks fail.

## Media, QA and follow-up

No stock photos or downloaded fonts. Existing SVG clock/icon geometry remains decorative; screenshots serve release evidence. Social metadata describes actual tasks; dedicated social-card artwork is not added in this release.

L1: typecheck, build, calculation/route/schema tests. L2: raw HTML crawl, five viewport samples, real error/recovery/search/calculation flows, links/404s, source review and deployment verification. Save production metadata/content fingerprints, link and schema inventories for drift. Lab performance is explicitly NOT RUN if an actual tool cannot supply it; no byte-count-to-Web-Vitals inference. GSC submission, field data and rankings remain UNVERIFIED until a connected property provides evidence. See release evidence documents.

No new owner sign-off is needed for the unchanged approved keyword/route map or previously authorized Cloudflare publication. No commercial evaluation or paid system is introduced.

## Owner-approved functional expansion — 2026-10-27

77 canonical pages: the original 72 plus /time-duration-calculator/, /countdown-to-date/, /date-calculator/, /time-calculator/ and /time-zone-converter/. Original 83 + 17 keyword strings and 64 primary target routes remain unchanged. No volume or difficulty metrics invented for the additional tools. Unique initial HTML titles, descriptions, H1s, methods and links describe each real operation. All five are linked from Home and generic calculator hubs, appear in search and Sitemap, and keep a self-canonical without settings fragments. Generic converter explanatory calculations are explicitly worked examples. Optional US federal observances follow OPM standard Monday–Friday observed-date conventions, 2021–2100; custom/state/employer closures remain separate.

## Owner-selected production domain — 2026-10-27

Canonical origin becomes https://timedurationcalculator.cc, site name Time Duration Calculator, public email contact@timedurationcalculator.cc. Preserve all original 83 + 17 keyword strings, their primary URLs, and all 77 paths. Only origin/site identity changes in canonical, Open Graph, WebSite/WebPage/breadcrumb entities, robots and Sitemap. Publish redirects only after the custom domain and HTTPS are verified. Do not overwrite the historical baseline or claim Search Console ownership/indexing without evidence.

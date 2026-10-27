# HowLong

A static English-language time and date tool website. Includes 77 pre-rendered pages: the original 72 pages plus five functional calculators. The original 64 keyword target routes are preserved. All 83 original keywords and 17 screenshot variants have a documented primary URL.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run check
npm test
npm run preview
```

Open the local URL printed by the server (normally http://localhost:4173). `npm run dev` builds and then starts the server. Rebuild and reload after editing source files.

## Cloudflare Pages

Connect the repository `garrison2025/howlong` to a **Pages** project using the Cloudflare dashboard. The application is a static export; no Worker, database, API keys or account system are needed.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm test` (builds and verifies all pages before publishing) |
| Build output directory | `dist` |
| Root directory | Repository root |
| Node version | `22` or newer |
| `SITE_URL` | The actual HTTPS origin shown for this project, without a trailing slash |

`SITE_URL` must use the confirmed Pages project domain or a custom domain that is actually connected. Do not use a sample domain. This value generates absolute canonical links, Open Graph URLs, robots.txt and Sitemap URLs. Cloudflare's `CF_PAGES_URL` is a fallback if no explicit origin is configured, but setting the production `SITE_URL` prevents preview build URLs from becoming canonical origins. Local builds without a real HTTPS origin deliberately use `noindex` and disallow crawling.

When adding a custom domain later: connect the domain in Pages, set `SITE_URL` to its HTTPS origin, redeploy, and verify canonical/Sitemap URLs and domain redirects. No domain purchase is necessary to use the provided pages.dev address.

## Project layout

- `src/core.ts`: framework-independent date, time-zone, elapsed-time and working-day calculations.
- `src/app.ts`: browser interactions and local preferences.
- `src/styles.css`: responsive light/dark interface; no external fonts or image requests.
- `scripts/build.mjs`: generates full HTML, metadata, internal links and Sitemap for every route.
- `data/pages.json`: the 72-page implementation manifest.
- `data/keywords.json`: the primary-page assignment for 83 original keywords and 17 supplemental variants.
- `tests/`: calculation boundaries and all-page metadata/coverage checks.
- `docs/keyword-coverage.md`: readable keyword deployment inventory.

There are no runtime dependencies. TypeScript is the only development dependency and is pinned with a lockfile.

## Calculation rules

- Clock countdowns use actual timestamps and browser IANA time-zone rules. During a repeated hour, the next still-future occurrence is chosen. A skipped clock time is advanced by the DST gap and labeled accordingly.
- Fixed-unit days are 24 hours. Calendar days and months are separate operations. Months clamp to the last valid day if the original day does not exist in the destination month.
- Business days exclude only the selected weekend days and explicitly entered dates. Public holidays are not silently applied. The start date is excluded by default.
- A year/month query represents a date range unless an exact date is entered. The reference date is visible and editable.
- Halloween targets local midnight on October 31; Thanksgiving targets local midnight on the fourth Thursday of November in the United States.
- Alerts require the page to stay open, the device to remain awake, and browser permission. They are not guaranteed alarms.

## Identity, feedback and privacy

The working display name is HowLong, based on the supplied repository. Change it in `site.config.json` when a permanent brand is chosen. The contact page uses the real repository Issues channel. `contactEmail` stays empty unless the owner supplies a real address.

No advertising, analytics or marketing pixels are installed. Calculator inputs stay in the browser. Only theme and clock-format preferences are saved to local storage. Optional shared countdown links contain settings in their URL fragment.

## Validation

`npm run check` checks all TypeScript. `npm test` builds the site and runs 30 test groups, including DST gaps/repeated hours, leap dates, month-end behavior, working-day rules, future dates, holiday rules, all keyword assignments, all 72 HTML pages, unique titles, labels, internal links, orphan detection, Sitemap entries, matching visible/structured breadcrumbs, versioned runtime imports, motion cancellation, dial visibility/resynchronization and reduced-motion/static fallbacks. Browser interaction verification and a deployed-site crawl supplement those tests.

`npm run audit:production` crawls the confirmed production origin (or `SITE_URL`), verifies routes/assets/Sitemap/404s, and records `docs/production-baseline.json` for future regression comparisons. It records raw-HTML metadata, content fingerprints, schema types and links. It does not measure rankings or Web Vitals. Review the output before replacing an accepted baseline.

Project-specific design, search architecture and actual verification evidence are documented in `DESIGN.md`, `SEO-GEO-PROJECT-BRIEF.md`, `UI-RELEASE-EVIDENCE.md`, `SEO-GEO-RELEASE-EVIDENCE.md` and `CLOUDFLARE.md`, following the owner's Website Starter Standard. No optional third-party scanner or hook is installed.

The implementation covers the research keywords. Search indexing, rankings and clicks must be measured after publication; they are not guaranteed by page creation.

## Functional tools added October 27, 2026

Clock/date-time intervals with breaks and explicit DST occurrences; arbitrary and yearly event countdowns with fixed-event sharing and .ics export; calendar date differences/addition; compound duration arithmetic; dated time-zone conversion. Existing conversion and working-day tools now support compound input, output-unit selection, between-date counting and optional standard US federal observances (2021–2100). Named calculations are opt-in device-local storage (12 maximum), with settings links and individual deletion/clear controls. No runtime dependencies or account system added.

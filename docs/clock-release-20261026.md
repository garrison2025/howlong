# Live homepage clock — 2026-10-26

Owner approved adding a realtime second hand to the existing homepage illustration. Keep the green/cream identity, existing dimensions, tool logic, field names, keyword map, 72 routes, textual time/timezone and decorative aria-hidden semantics.

## Implementation and checks

- One thin, transform-positioned second hand. Hour/minute angles include the seconds fraction. Angles come from a fresh device timestamp in the selected IANA zone, not accumulated rotations.
- Reuse the existing countdown scheduler. No new interval, requestAnimationFrame loop, package, GIF/video or runtime service.
- IntersectionObserver gates drawing to visible illustration; document visibility gates background drawing. Return to viewport/tab immediately reads current time.
- Reduced-motion retains an accurate resting frame and hides the second hand. Timer calls do not update its hands, but explicit settings/preference/visibility changes can recalibrate the static frame. Functional text countdown continues.
- Without observation/JavaScript, the original static illustration remains. No new aria-live region or focus movement.
- New dial module participates in the existing content-versioned runtime imports.

| Verification | Status | Actual evidence |
|---|---|---|
| TypeScript, build and regression suite | PASS | npm run check; npm test: 30 groups |
| Fractional hand positions and 59 → 00 | PASS controlled unit test | 10:30:45 gives 315.375° / 184.5° / 270°; midnight returns all hands to 0° |
| Hidden/offscreen pause and resync | PASS controlled unit test | No time reads while hidden/offscreen, including forced updates; return reads fresh supplied time |
| Reduced-motion preference | PASS simulated preference | Initial resting frame, periodic freeze, explicit recalibration and resumed normal updates exercised |
| Missing dial/observer | PASS unit test | No clock reads or exceptions; static fallback retained |
| Real visible desktop clock | PASS browser sample | 1280px view: hand rotations changed between observations; three hands visually inspected; document width 1265px, no horizontal overflow |
| Real offscreen/return and timezone | PASS browser | Scroll moved dial bottom to -1211px; second hand remained rotate(282deg) across later observations while digital countdown changed. Select UTC and scroll back: hour/minute/second recalibrated to 210.725° / 8.7° / 162°, matching 07:01:27 |
| Phone layout | PASS sample | 390px: decorative dial display=none, document width 375px, no horizontal overflow; hidden-dial observer behavior covered by controlled tests |
| Physical/OS reduced-motion emulation | NOT RUN | Unit preference simulation is not an OS/browser-emulation claim |
| Lab/field performance | NOT RUN / UNAVAILABLE | No new Web Vitals measurement or claim; record actual module bytes after release |
| Production | PASS | Functional commit 33ba1f73c6e3513667486230a25a4837e126e40f; asset version 149851c9cd21. Public page displays the added hand and advances to current local time, with no browser error/warn entries. App, calculation core, motion, dial and stylesheet assets all match the local tested build |

New dial module: 1,456 uncompressed bytes. This transfer measurement is not a Web Vitals score. Production crawl: 72 normal routes, 72 Sitemap entries, zero orphan pages, expected 404/noindex and existing redirects. Comparison to preserved baseline: keyword hash unchanged; zero changes in status/title/description/H1/canonical/robots. Only the homepage main-content fingerprint changes, for the approved additional hand. Audit artifacts in delivery folder: howlong-clock-assets.json, howlong-clock-production.json, howlong-clock-nonregression.json.

No ranking, speed or accessibility-certification claim is inferred from these tests. The existing accepted search baseline remains preserved. A new crawl may change only the homepage content fingerprint for the approved added hand; metadata, keywords, routes and calculation core must stay unchanged.

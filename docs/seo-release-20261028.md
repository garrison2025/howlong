# SEO improvements — 2026-10-28

The owner approved implementation of the production SEO audit. Preserve all 77 routes, 83 original keywords, 17 supplemental variants and their primary intent mapping. No calculation rules, input IDs, legal copy, tracking or dependencies changed.

## Changes

- Added Duration calculator to navigation and Calculate time duration to the homepage hero. Existing countdown and converter actions remain.
- Duration recommendations now use the same unit and nearest amounts; clock recommendations prefer the same AM/PM intent and nearest time. Other numeric task recommendations sort by proximity. General hub links remain.
- Replaced the repeated 72-hour paragraph with a preset-specific worked explanation. Minute answers expose both decimal hours and hours/minutes in initial HTML.
- Added static interval examples for normal hours, breaks, overnight and reversed endpoints. These explicitly use fixed clock-time rules, separate from dated timezone calculations.
- Avoided duplicate brand suffixes in titles and gave the generic years calculator its own description.
- Wrapped homepage actions and adjusted narrow desktop navigation to accommodate the new entry. Existing motion and reduced-motion support remain.

## Verification before publication

- TypeScript check: PASS.
- Build and 41 tests: PASS, including keyword/route coverage, canonical metadata, links, calculation and motion boundaries, and two new SEO regressions.
- Browser: 390px homepage core action visible around y=279px. 320px interval page has no horizontal document overflow; subtracting 30 minutes gives 8h; excessive break clears the result and disables copying. 768px navigation checked and corrected to keep wrapped links inside the header.
- Search Console indexing, CrUX and Lighthouse: UNVERIFIED. No claim about rankings or measured Core Web Vitals.
- Accepted historical production baseline retained. Post-publication results recorded separately after the live release is confirmed.

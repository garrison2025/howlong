# General calculator intent and contextual links — 2026-10-28

Owner authorized all follow-up audit work except Search Console; no Search Console account accessed or settings changed.

## Changes

- General duration converter explains fixed units, decimal/compound notation and calendar/approximate methods. The 72-hour default remains an editable example; specific duration pages retain their own explanations.
- General years calculator explains year/month ranges, exact dates, reference dates, leap-day examples and calendar difference rules. The 2018 page retains its specialized explanation.
- Five supplemental tools each link to three complementary tasks in their Related tools section; no empty related section remains.
- Four ambiguous AM/PM countdown titles remove duplicate countdown wording. Routes, H1s, dual outputs, keyword mapping, calculator fields and runtime code remain unchanged.

## Validation

- TypeScript: PASS. Build and 42 tests: PASS, including preserved 77 routes and 83 original + 17 supplemental keywords.
- 390px browser conversion: 90 minutes → 1.5 hours, no document overflow. Generic methods visible in initial HTML.
- Public PageSpeed API requests for three routes failed. The official PageSpeed website succeeded for the homepage: mobile lab performance 100, accessibility 100, best practices 92, SEO 100; LCP/FCP/Speed Index about 1.5s, TBT 0ms, CLS 0. No real-user data available. Report: https://pagespeed.web.dev/analysis/https-timedurationcalculator-cc/a3xp15d1f9?form_factor=mobile . This is a single lab result, not a ranking or accessibility certification.
- Best-practices diagnostic: Cloudflare-injected beacon blocked by existing self-only CSP. Pages project Metrics already reports Web Analytics disabled; account-level Web Analytics list has no current hostname. The Pages documentation says injection changes on the next deployment. Verify after release before changing any security policy. No CSP weakening or unrelated account changes authorized or performed.
- Historical accepted production baseline retained; live release verification is recorded independently.

## Follow-up measurement and correction

The first content deployment removed the previously injected beacon; the live years hub contains the new broad-task explanation and no cloudflareinsights script. No Cloudflare settings or CSP were changed. Core interval mobile lab result: performance 100, accessibility 96, best practices 92, SEO 100; LCP 1.5s, TBT 0ms, CLS 0.027. Report: https://pagespeed.web.dev/analysis/https-timedurationcalculator-cc-time-duration-calculator/ma61v7bwli?form_factor=mobile . This initial report predates beacon removal. Its accessibility finding identifies the worked-example table column headers. Use the existing main ink token for these headers in both themes, then verify computed contrast and repeat the lab measurement.

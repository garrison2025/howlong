# Calculator usability follow-up — 2026-10-28

Implements the owner's approved audit follow-up. Existing calculation rules, field order, navigation, 77 routes and all 83 original + 17 supplemental keyword mappings are preserved. No runtime dependencies, tracking or new indexable routes.

- Mobile calculators offer a View calculation result button after the primary result scrolls above the viewport. An IntersectionObserver avoids scroll polling; clicking returns to and focuses the result panel. The button stays hidden on desktop and while the result is visible. Existing reduced-motion scrolling rules apply, and bottom spacing accommodates the button.
- Duration search matches the requested primary number and unit, preventing cross-unit keyword aliases from making 90 Seconds appear for 90 mins. Singular unit spellings and existing abbreviations normalize consistently; clock/task searches retain their existing behavior.
- Date shift captions use singular units for both 1 and -1. Date interval day counts and calendar difference details also use the correct singular form.
- The date calculator provides initial-HTML examples for leap-year month-end clamping and backward counting, plus buttons to load the stated inputs. Buttons appear only after JavaScript binds them; the readable examples and explanations remain without JavaScript. Loading an example explicitly replaces the inputs.

Pre-publication validation: TypeScript PASS; 45 automated tests PASS, including the cross-unit search regression and existing route/keyword coverage checks. Browser: 90 mins returns only 90 Minutes; +1 and -1 month captions are singular; January 31, 2024 + 1 month returns February 29; the backward example returns -5 calendar days; invalid dates disable copying, the mobile result button returns focus to the error/result, and valid input recovers. At 320px, no document overflow; the button is hidden at desktop width. Browser error/warning log empty on the checked local date flow. Screenshots and the post-publication crawl are kept separately in outputs/usability-release-20261028, without replacing the accepted SEO baseline.

Search Console and real-user Core Web Vitals remain unverified. No new Lighthouse score or ranking result is claimed.

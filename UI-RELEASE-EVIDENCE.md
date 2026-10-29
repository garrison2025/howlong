# HowLong UI release evidence — 2026-10-26

Scope: existing-site alignment with Website Starter Standard. Operate calculators and Read explanatory surfaces. Protected keyword map, all 72 routes, brand, field order/IDs, navigation labels and core calculation implementation are unchanged. Design authority: `DESIGN.md`.

## Observed findings and disposition

| Finding | Priority | Evidence | Resolution |
|---|---|---|---|
| Input below initial phone viewport on 90-minute tool | P2 | Before native expandable conversion details, amount field top ~869px at 431px width | Fixed: details retain full raw-HTML table; amount now ~646px at 390px and ~674px at 360px |
| Small form/action text and action targets | P2 | Source: 13px input, 36px icons, 9–10px quiet actions | Fixed: mobile inputs 16px; icon/quiet actions >=44px; clearer labels/metadata |
| Errors not associated with fields; copying stale results possible | P1 | Existing protect handler had no aria-invalid/describedby and left copy enabled | Fixed and exercised: empty converter and countdown field mark invalid, point to status, disable copy; recovery clears state |
| Keyboard dialog dismissal lacked explicit handler | P2 | Initial Escape key exercise left search open | Fixed: explicit Escape handling; real key exercise now closes it |
| Countdown recreated unit-table cells every tick and processed hidden pages | P2 | Source inspection | Reuse existing cells; skip hidden-tab calculation unless alerts are enabled, preserving optional alert behavior. No background CPU profile claimed |

## Actual verification ledger

| Area | Status | Evidence |
|---|---|---|
| Five viewport sample | PASS | CUA browser, `/how-long-is/90-minutes/`, 360/390/768/1024/1440px, 900px height; document widths 345/375/753/1009/1425px, no horizontal overflow |
| Visual sample | PASS | Settled 390px screenshot and 768/1440px screenshots inspected; green/cream identity and input/result hierarchy retained |
| Empty/error/recovery | PASS | Converter: empty input → visible error, aria-invalid=true, describedby=tool-status, copy disabled. Restore 120 → 2 hours, errors cleared, copy enabled. Countdown empty/restore similarly exercised after final build |
| Native conversion disclosure | PASS | Expanding details shows 120 minutes = 7,200 seconds = 2 hours; all table rows remain in initial HTML |
| Keyboard search and Escape | PASS | Focus search trigger; `/` opens/focuses search input; query finds correct page; final Escape exercise returns dialog open=false |
| Theme | PASS | Actual toggle produces dark root, body rgb(238,242,232) on rgb(20,33,29); dark holiday layout inspected |
| Touch-target geometry | PASS sample | Countdown copy/fullscreen/share buttons measured 44px high; icon controls set to 44px. Native mobile touch hardware NOT RUN |
| Contrast samples | PASS sample | WCAG luminance calculation: light body 12.93, muted 4.72; dark body 14.63, muted 8.61; countdown text 10.86, digits 8.89; light error 6.51. This is not a full accessibility certification |
| Month end | PASS | 1 month from 2024-01-31 → Thursday 2024-02-29 |
| Business day | PASS | 3 business days from Friday 2026-10-23 → Wednesday 2026-10-28 |
| Year range | PASS | August 2018 vs 2026-10-26: endpoints 2018-08-01/31 → 3,008/2,978 days with separate calendar differences |
| Century | PASS | 1 century from 2000-02-29 → 2100-02-28, 36,524 calendar days |
| Holiday | PASS sample | 360px dark Thanksgiving page: US target 2026-11-26 midnight, no horizontal overflow |
| Runtime logs | PASS sample | No error/warn entries after sampled month/business/year flows |
| Type/build/test | PASS | npm run check; npm test, 22 groups, no failures |
| Reduced-motion | PASS source / NOT RUN emulation | Existing reduced-motion rule disables animation/transitions; no essential content hidden. Actual OS/browser reduced-motion emulation not performed |
| Static/no-JS | PASS raw HTML | Direct answers, labels, tables, methods and links present; interactive limitation notices. Browser JS-disabled mode NOT RUN |
| Performance lab | NOT RUN | Public PageSpeed API request failed to connect; `outputs/howlong-performance-check.json` delivery evidence. Transfer bytes are not LCP/INP/CLS |
| Field performance, rankings | UNAVAILABLE | No connected CrUX/GSC field dataset |
| Multilingual/drag/showcase | NOT APPLICABLE | Single English site, native controls, no visual cloning or video export |
| Optional scanners/hooks | NOT RUN | No Impeccable binary, hook, extension or Live server installed |
| Production verification | PASS scoped | Public 90-minute page: 120 → 2 hours; empty → aria-invalid=true and copy disabled; final public assets match local build byte-for-byte. See SEO-GEO release evidence |

Screenshots are in the delivery folder above this repo: `howlong-standard-after-mobile.png`, `howlong-standard-360.png`, `howlong-standard-390.png`, `howlong-standard-768.png`, `howlong-standard-1024.png`, `howlong-standard-1440.png`. They are real local browser captures, not generated mockups. Before capture can transiently scale when viewport override changes; final settled screenshots and DOM widths are authoritative for the sampled sizes.

Known limitations: no physical touch-device, screen-reader, 200% text-zoom, reduced-motion emulation, Lighthouse/CrUX or full cross-browser certification. No unresolved observed P0/P1 issue in tested scope. This release record does not assert that every item in the upstream standard is measured or certified. Revert the functional release commit to roll back; keep subsequent changes scoped to actual findings.


## 2026-10-29 existing-site quality maintenance

See [quality review](docs/quality-review-20261029.md) for scope, confirmed navigation/cache repairs, 49 passing tests, fresh mobile Lighthouse baseline and viewport validation limits. Preserve historical evidence above.

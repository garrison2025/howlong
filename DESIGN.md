# HowLong design system

Reviewed 2026-10-26 against [Website Starter Standard](https://github.com/chenmu2024/Website-Starter-Standard). This is an existing-site improvement, not a new business or brand decision.

## Product truth and intent

English time/date calculators for visitors arriving from specific organic-search questions. Tool surfaces are **Operate**; definitions, methods, directories and legal/support copy are **Read**. The homepage introduces the same tools and must expose a working countdown early. Success means entering a value, understanding its assumptions and obtaining the correct result. Revenue evaluation is excluded by the owner.

Preserve HowLong, its forest-green/cream identity, all 83 approved keywords and 17 supplemental variants, 64 target routes, 72 total routes, form field order/IDs, navigation labels, legal copy and calculation rules. No new keyword pages, translations, analytics, paid dependencies or invented proof.

Design read: precise, calm time tools for English-speaking search visitors; readable controls and explicit date rules take priority over decorative space.

## References and diagnosis

- [timeanddate working-day tool](https://www.timeanddate.com/date/workdays.html): task-specific heading, visible options and adjacent explanations. Adopt clear grouping; do not copy its broad portal navigation or holiday capabilities.
- [Calculator.net date calculator](https://www.calculator.net/date-calculator.html): persistent field labels, explicit counting options and separate date operations. Adopt concise task hierarchy; retain our existing input order and brand.
- Existing HowLong production interface: preserve green result panel, tabular digits, restrained clock illustration and shared directory links; compress the oversized introduction and raise small text/control sizes.
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) reviewed as the required reference catalogue. Select context-specific consistency and token documentation; no third-party brand skin imported.

Observed source issues: 8–11px metadata and action text; 36px icon targets and smaller quiet buttons; 13px mobile form text; weak error-to-field association; placeholder breadcrumb category rather than a navigable parent. Existing screenshots: `outputs/howlong-standard-before-mobile.png` and `outputs/howlong-live-desktop.png` in the delivery folder. Screenshot capture at a newly changed viewport can transiently scale the preview; rely on the settled viewport for final inspection.

## Tokens and layout

| Role | Light | Dark |
|---|---|---|
| Canvas | #f6f7f3 | #14211d |
| Surface | #ffffff | #1d2e27 |
| Ink | #1d302b | #eef2e8 |
| Muted | #66716b | #b1beb4 |
| Border | #dce2d8 | #3a4c42 |
| Action | #203d34 | #cde0a5 |
| Error | #a6382d | #ffaea1 |

Result panels retain #203d34 with #f3f7eb text and #d5e7a7 digits in either theme. Use existing semantic variables. No decorative stock images, new gradients or heavy shadows.

System stack: Segoe UI, Arial, sans-serif (existing Inter-first declaration resolves locally if available; no font downloads). Body 15px/1.65, explanatory text at least 14px, form labels/metadata at least 12px, controls 16px on mobile, major headings 30–57px. Tabular numbers for live values; use overflow wrapping for dates and long results.

Spacing derives from 4/8/12/16/24/32/48px. Container 1180px; gutters 32px desktop, 20px mobile. Existing 14px result/control panels, 5px inputs and 7px buttons remain. Reading copy stays within existing article columns. No new slider, tab, pagination or tooltip components are needed.

Desktop: result and controls share two columns. At <=760px, preserve result-before-controls reading order, reduce intro/panel spacing and keep core controls near the result. At <=380px, narrower digit gaps prevent four-part holiday overflow. Directories use 2/3/4 columns as space allows. Header collapses at 760px. Check 360/390/768/1024/1440px. Tables may scroll within their own wrapper, never widen the document.

## Components, states and accessibility

- Icons/actions: minimum 44px target; visible keyboard focus; concise accessible name.
- Inputs: persistent labels; native constraints plus calculation validation; invalid controls reference the visible status message; clear invalid state when corrected.
- Results: errors remove stale values and disable copying; success restores it. Results and errors wrap. Live seconds are not live-region announcements.
- Search: native dialog, Escape to dismiss, real links and a truthful empty state. Navigation uses `aria-current` only for its actual destination.
- Breadcrumb: semantic navigation, Home, real parent hub where distinct, current page; JSON-LD must describe those same items.
- Buttons: hover background, visible focus, disabled opacity and no pointer cue. Native elements preserve keyboard operation.
- Native CSS 160ms color/background/transform feedback only; no entrance delay or hidden essential copy. Reduced-motion disables transitions. Skip hidden-tab countdown work; refresh from the actual timestamp when visible.
- Contrast targets: WCAG AA 4.5:1 normal text and 3:1 large text; measured samples recorded in UI evidence, not assumed certification.
- No network/API dependency for calculations. Network failure affects initial delivery, not an already-loaded tool. No-JS keeps fixed answers, methods and links; an explicit notice explains interactive limitations.

DESIGN_VARIANCE 4, MOTION_INTENSITY 2, VISUAL_DENSITY 6 are design shorthand, not quality scores. No video/Figma export or matched-image cloning is in scope. Performance measurements and field data must be labeled NOT RUN/UNAVAILABLE when absent; byte counts are not Core Web Vitals.

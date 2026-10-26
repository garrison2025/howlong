# HowLong interaction motion — 2026-10-26

Owner approved the proposed tool-focused motion refinement. No keyword, route, title, canonical, field ID/order, calculation or legal/privacy copy is changed. No animation package or runtime service is added.

## Implementation

- Shared 160ms feedback / 200ms entrance timing, cubic-bezier(.2,0,0,1), CSS variables and native Web Animations API.
- Valid user-driven result changes gently emphasize the already-updated primary value; initial rendering and ordinary countdown ticks do not animate. From-now output receives the same feedback.
- Native details animate their visible content on opening. Closing retains immediate native behavior and cancels pending effects; no height tween or delayed state update.
- Search enters with a short opacity/transform transition. Search focus is immediate, and Escape/backdrop/close dismiss immediately. Reopening cannot create a duplicate modal.
- Rapid retriggers cancel only that target’s prior animation. Finished/canceled effects are released; no fill-mode or stale inline styles remain.
- Reduced-motion preference skips new JS effects and cancels running effects on change; CSS transitions already respect the preference. Hidden tabs cancel UI motion. Missing Web Animations uses the visible static state.
- `motion.js` is included in the content-derived asset version and its browser import is versioned with the entry point.

## Evidence

| Check | Result | Actual evidence |
|---|---|---|
| TypeScript / build / tests | PASS | npm run check; npm test: 26 passing groups |
| Motion lifecycle and preference handling | PASS simulated-browser unit tests | Repeat/cancel, independent targets, finish cleanup, preference change, hidden document and missing API tests run against compiled motion module |
| User-driven visible feedback | PASS browser | 180-minute input immediately produces 3 hours; computed in-flight value opacity observed at .6612 |
| Rapid repeated input | PASS browser | 60 → 120 → 180 → 90 finishes at 1.5 hours; focus remains duration-value and copying is enabled |
| Detail state | PASS browser | Open content remains readable; three additional toggles finish closed, native state correct |
| Search and keyboard | PASS browser | Modal opens with focus on tool-search; Escape immediately returns open=false |
| Countdown | PASS browser/source | Quick 5 PM target change yields 5:00 PM, seconds computed opacity remains 1; motion is called by settings handler only |
| Phone layout | PASS sample | 390px page document width 375px, no horizontal overflow |
| Runtime logs | PASS sample | No warning/error entries after tested converter, disclosure and search actions |
| Actual OS/browser reduced-motion emulation | NOT RUN | Preference branches and preference-change cancellation are unit-tested; this is not a claim of OS emulation |
| Performance lab / field | NOT RUN / UNAVAILABLE | No new Lighthouse/CrUX/INP measurement; no numeric performance claim |
| Production | PENDING | Verify deployed module/version, task flow and raw-HTML regression after publication |

Screenshots show resting states only and are not proof of animation timing. Actual in-flight style, interaction observations and cancellation tests supply the motion evidence. No promotional video export is in scope. Existing accepted production baseline remains preserved; compare new crawl to it before recording acceptance. Revert this scoped release through Git history to roll back motion without changing tool data.

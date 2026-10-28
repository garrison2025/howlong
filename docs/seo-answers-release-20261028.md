# Clear preset answers and task descriptions — 2026-10-28

Owner approved the three audited changes; Search Console remains deferred.

- Preset fixed-unit answers now put whole units and remainders first, followed by decimal notation. Rounded decimal representations are labeled approximately. Calendar month rules are unchanged. These are preset explanations; editable calculation outputs and validation retain their existing behavior.
- Ten tool/content landing pages receive task-specific descriptions, reused by the existing Open Graph and WebPage schema generation.
- The general business-day tool introduces advance/backward and between-date tasks, endpoint settings and optional US-calendar limitations. Specific 3/5/range landing pages retain their specific introductions.
- All 77 routes, 83 original + 17 supplemental keywords, field IDs, runtime calculation rules and dependencies remain unchanged.

Validation: TypeScript PASS; build and 43 tests PASS. New regression covers compound preset answers, rounding labels, the ten descriptions, and separation of general/specific business pages. Browser at 390px confirms no horizontal overflow, the human-readable 100-hour answer, unchanged negative conversion and explicit empty-input error. Business-day introduction and controls checked in the actual browser. Post-release crawl is stored separately from the historical accepted baseline. No new lab or real-user performance claim.

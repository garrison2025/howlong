# Mobile homepage clock correction — 2026-10-26

The owner reported that the new clock was invisible on phones. Cause: the existing <=760px hero rule intentionally used display:none. This release overrides that historical layout decision with a compact, visible phone dial.

Only CSS and project design/evidence documentation change. No new HTML, timer, observer, animation library, calculation, keyword, URL or legal/privacy text.

- 82px dial placed beside the homepage heading; 112px of heading space reserved, including outer ring clearance. Body text/actions retain full width below it.
- Scale numerals, center and all hands together. Decorative tagline is omitted on phones; desktop illustration retains its existing layout.
- Existing visibility/background/reduced-motion policies remain in force. Now-visible phone clocks update once per second through the existing timer.
- Typecheck and all 30 test groups pass.
- Browser samples: 320/360/390/430/768/1280px, no horizontal overflow. Phone heading right edge precedes dial left edge by 20px; phone dial is display:block and 82px wide.
- Settled screenshots inspected at 390px and 320px. At 320px the title wraps to three lines; body and controls remain separate and usable.
- Actual phone-width second-hand observations changed rotate(84deg) → rotate(264deg). No warning/error log entries in the local sample.
- Real touch hardware, OS reduced-motion emulation and new lab/field performance metrics: NOT RUN. This CSS correction does not establish a Web Vitals score.

Production verification: PENDING publication. Preserve the accepted SEO baseline; compare protected metadata and keyword hash after release. This supersedes the earlier release’s mobile-hidden illustration note.

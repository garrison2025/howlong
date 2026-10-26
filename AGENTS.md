# HowLong project rules

Apply the owner's [Website Starter Standard](https://github.com/chenmu2024/Website-Starter-Standard) in proportion to this existing static calculator site. Read `DESIGN.md` and `SEO-GEO-PROJECT-BRIEF.md` before UI, template or search changes. Record actual checks in the release evidence files; NOT RUN is not PASS.

- Preserve `data/keywords.json` (83 original + 17 supplemental variants), its primary intent ownership, 64 target routes and 72 total routes unless the owner explicitly changes scope.
- Preserve brand, working calculation rules, field IDs/order, navigation labels and legal/privacy copy. No revenue assessment is in scope.
- Reuse existing TypeScript/static builder/CSS. Do not add runtime dependencies, paid infrastructure, scanner hooks or external analytics by default.
- Public SEO content, metadata, links and truthful schema must be in initial HTML. No duplicate AI-answer pages, fake reviews or ranking guarantees.
- Run `npm run check` and `npm test`; inspect relevant real browser flows, narrow/wide layouts and error states. After authorized publication, verify production and compare its search baseline.
- Do not overwrite the accepted production baseline before inspecting changes. Keep unavailable Lighthouse/CrUX/GSC results explicitly unverified.
- Deploy through the existing GitHub main → Cloudflare Pages connection; see `CLOUDFLARE.md`.

These rules apply to this repository only. They do not install or modify global skills, memory, hooks or browser extensions.

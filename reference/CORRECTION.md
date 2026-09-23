# Local dusk correction — 2026-09-23

## State and scope

Inspected `reference/approved-homepage.png` directly at 1055 × 1491, then rendered and inspected the existing site before editing. Its SHA256 remains `CA4B5ECE18DAC9A7AD7B16CDA0272E62658F5CE34C6A5638B8CB7A2B16216723`.

Verified baseline: `75f02de02d7e6d7c0a0d156190dfa0ec0ee465cb` on main, following the earlier authorized publication. The original baseline `072ca503bedf20060a20e86ab22c729e054aa4c5` is historical. `work/fidelity-correction` starts from the current baseline. Original user files remain untouched and untracked. The latest request is local review first; this branch does not replace the live preview.

## Changes

- Replaced the sign/plant/lamp hero with the user's exported storefront concept, edited to remove the silver crate and pallets on the right. Deep blue dusk shadows, a muted amber horizon and restrained teal interface accents connect the image to the site. The footer identifies the image as an edited concept.
- Adjusted header height, logo scale, headline scale, paragraph width, button spacing and section proportions against the approved reference.
- Added the user-selected Kirbyville sunset image to the scenic bands and location card; included the supplied small interior overview in the first card. Source limitations are recorded in `ARTWORK.md` and `RESEARCH.md`.
- Incorporated the user-transcribed address, phone and daily hours into `src/data/store.js`, static HTML, contact links, address-search links and structured data. Unknown social URLs remain null. The supplied Google business listing is linked; ratings and review excerpts are not reproduced.
- Smoke now rises at 7–14 CSS pixels per second with bounded side drift, predominantly left-edge placement, soft filament sprites and fading. The wordmark remains static; the effect does not emerge from merchandise or form promotional lettering.
- Retained pause/resume, live reduced-motion response, offscreen/hidden-tab suspension, a 30fps target, bounded particles and DPR caps. Paused frames repaint on resize.
- On mobile, the storefront is positioned below the copy and controls. Cards reflow into two columns and then a wide final card. All information and navigation remain available without JavaScript.
- Added four project skills and research/review records. All skills passed the skill-creator validator using an isolated uv Python environment. No site dependency was added.

## Measured desktop composition

| Band | Reference, approximate px | Before | Candidate |
| --- | ---: | ---: | ---: |
| Hero | 444 | 444 | 444 |
| Five cards | 283 | 287 | 283 |
| Scenic/about | 219 | 219 | 219 |
| Reviews | 220 | 224 | 220 |
| Location | 207 | 215 | 207 |
| Footer | 118 | 172 | 165 |

The candidate is 1539px tall at 1055px width versus the 1491px reference. Minor rounding occurs at section boundaries. The location panel starts at x466.9 versus approximately x469 in the reference. The footer is taller to accommodate contact details, the requested greeting and preview disclosures. No mobile reference was supplied.

## Verification and evidence

- `npm run build`: passed.
- `npm run smoke`: 52 passed, 0 failed.
- `npm run verify:browser`: 52 passed, 0 failed.
- `npm run verify:visual`: passed, including upward smoke travel, left concentration, offscreen suspension, pause/resume, live reduced motion, print visibility and no-JS navigation.
- Combined widths checked: 320, 360, 390, 430, 768, 1024, 1055, 1440 and 1920px.
- Fact-dependent checks now validate the supplied values and also exercise false verification flags. Existing checks were preserved rather than bypassed.
- Local production preview: `http://127.0.0.1:4187/vnm-kirbyville-preview/`, HTTP 200, design marker `storefront-local-v4`, `noindex,nofollow`.

Evidence: [side-by-side comparison](correction/comparison.png), [desktop 1055](correction/desktop-1055.png), [desktop 1440](correction/desktop-1440.png), [mobile 390](correction/mobile-390.png), [smoke start](correction/smoke-start.png), [smoke later](correction/smoke-later.png), [measurements](correction/visual-evidence.json), [local checks](correction/local-evidence.json). The [comparison HTML](correction/comparison.html) supports full-size inspection. Additional widths and interaction screenshots remain in ignored `artifacts/screenshots/`.

Production JS: 9.32 KB (3.74 KB gzip); CSS: 24.51 KB (6.84 KB gzip). The four image files used by the page total 348,425 bytes. Older unused atmosphere files remain in the repository; that image total is not the entire dist directory. No Lighthouse score or device performance claim is made.

## Remaining visual differences and limitations

This factual version preserves the reference's broad geometry, dark palette and section order, but does not reproduce its promotional product arrangement, advertising slogans, product-category cards or testimonials. It is not an exact match to the full reference. The requested smoke-to-store-name effect is not implemented.

The storefront is edited concept artwork, not an independently verified dusk photograph. The user-supplied interior image is a small thumbnail and visibly soft; a full-resolution original would improve it. The selected sunset's independent geolocation and open reuse rights have not been established. Contact details are sourced to the user's transcription, not a successful live Google API inspection. These limits should remain clear during local review and any later publication decision.

## Changed files

- Page and data: `index.html`, `src/data/store.js`, `vite.config.js`.
- Behavior: `src/scripts/main.js`, `src/scripts/motion.js`.
- Styles: `src/styles/components.css`, `src/styles/sections.css`, `src/styles/responsive.css`.
- Verification: `src/scripts/smoke.js`, `src/scripts/verify-browser.js`, `src/scripts/verify-visual.js`.
- Assets: `public/assets/storefront-dusk.webp`, `public/assets/kirbyville-sunset.webp`, `public/assets/store-interior.jpg`.
- Documentation: `README.md`, `reference/ARTWORK.md`, `reference/RESEARCH.md`, `reference/REVIEW-MATRIX.md`, this report, `reference/correction/*` evidence.
- Project skills: `.agents/skills/vnm-reference-fidelity/SKILL.md`, `.agents/skills/vnm-rising-atmosphere/SKILL.md`, `.agents/skills/vnm-source-verification/SKILL.md`, `.agents/skills/vnm-preview-review/SKILL.md`.

The Pages workflow, deployment base, package lock, static architecture, accessibility behavior and preview indexing policy are preserved. The original user PNG and `store inside/` source folder are excluded from the candidate commit.

# Vape N More — Kirbyville preview

[Open Vape N More — live website preview](https://anonymousnomad.github.io/vnm-kirbyville-preview/)

The live link shows the current GitHub Pages deployment from `main`.

A factual, age-restricted business-information preview. Semantic HTML, custom CSS,
vanilla JavaScript and Vite; no ecommerce, backend, offers or inventory claims.

This is an unofficial design demonstration. Indexing stays disabled through
`noindex,nofollow` and a disallow-all robots file. It is not an authorized business website.

## Reference reconstruction

The reviewed homepage was developed on `work/homepage-art-direction`, based on
`b7b8cf9`. After local review, the user authorized publishing this version for an
in-person presentation. The link above and the repository's About website link
open the current GitHub Pages preview.
After `npm run build`, start `npm run preview -- --host 127.0.0.1` and open
http://127.0.0.1:4187/vnm-kirbyville-preview/.
See the [homepage art-direction report](reference/ART-DIRECTION.md),
[complete supplied-media inventory](reference/MEDIA-INVENTORY.json),
[earlier correction report](reference/CORRECTION.md),
[research ledger](reference/RESEARCH.md), and [review matrix](reference/REVIEW-MATRIX.md).
Project skills are under `.agents/skills/`.

Originally developed on `work/visual-reconstruction` from
`072ca503bedf20060a20e86ab22c729e054aa4c5`; publication to the existing live URL
was explicitly authorized by the user on September 23, 2026.

The supplied [approved homepage](reference/approved-homepage.png) is the visual authority.
See [the reconstruction report](reference/RECONSTRUCTION.md) for the visual decisions,
verification evidence and remaining differences. The Pages workflow deploys pushes to main.

## Run and verify

- `npm ci` — install locked dependencies.
- `npm run dev` — Vite development server on port 5199.
- `npm run build` — static production output in dist/.
- `npm run smoke` — 52-check static gate, including supplied-fact and fallback checks.
- `npm run verify:browser` — 52-check Edge browser gate and screenshots.
- `npm run verify:visual` — extra widths, motion controls, no-JS navigation and print checks.
- `npm run verify:gallery` — media coverage/deduplication, one-time shuffle, rotation,
  pause, keyboard, touch, reduced motion, lightbox and no-JS image access.
- `npm run og` — regenerate the neutral Open Graph image from its HTML template.

Browser checks require Microsoft Edge, driven by the existing playwright-core dependency.
The deployment base remains /vnm-kirbyville-preview/. Screenshots are written to
artifacts/screenshots/; pre-rebuild screenshots are retained locally in artifacts/baseline/.

## Business facts

[src/data/store.js](src/data/store.js) remains the source of truth. On September 23,
2026, the user supplied a Google-listing transcription: 21034 US-96, Kirbyville,
TX 75956; (409) 279-1126; daily 9 AM–9 PM. The verified flags record this supplied
confirmation, not an independently inspected live Google feed. These details are
rendered in static HTML and structured data. Directions search the supplied address;
no map coordinates or place pin are invented. Unknown social URLs remain null.
The supplied Google share URL links to the business listing. Ratings and review
excerpts are not reproduced; no inventory, pricing or customer claims are invented.

The hometown greeting, “Have a blessed day. Be safe.”, follows the user's report of the
owner's customary greeting. It is not a customer testimonial or an assertion of religion.
The user's report of a Facebook page is not sufficient to invent its URL.

## Structure

- index.html: semantic page, accessible navigation, factual information and greeting.
- src/styles/: tokens, shared styles, section composition and responsive layouts.
- src/scripts/main.js: verified business-data hydration and enhancement boot.
- src/scripts/motion.js: menu, reveals and slow, fading canvas atmosphere.
- src/data/media.js: audited interior image manifest, rendered into static HTML by Vite.
- src/scripts/gallery.js: one-time shuffle, predictable rotation and accessible lightbox.
- public/assets/store/: three distinct supplied environmental store views.
- public/assets/storefront-dusk.webp: edited dusk concept from the user's exported artwork.
- public/assets/kirbyville-sunset.webp: the user's selected scenic image; source in the artwork ledger.
- The earlier generated hero/forest/card images remain unused by this homepage.
- src/assets/og-template.html: factual social-preview source.
- vite.config.js: existing token replacement, Pages base and indexing assets.
- .github/workflows/deploy-pages.yml: existing main-only Pages deployment.

All content remains available without JavaScript. Reduced-motion users receive the same
static layout and illustration; the smoke is disabled. A pause control is available to
other users. Animation stops when the hero is offscreen or the tab is hidden.

The storefront is an edited concept, not documentary evidence of the store at dusk.
Its silver crate and pallets were removed as requested. See [asset provenance](reference/ARTWORK.md).

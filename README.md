# Vape N More — Kirbyville preview

[View the live website preview](https://anonymousnomad.github.io/vnm-kirbyville-preview/)

The live link shows the current GitHub Pages deployment from `main`. The visual
reconstruction on this candidate branch is awaiting review and is not deployed yet.

A factual, age-restricted business-information preview. Semantic HTML, custom CSS,
vanilla JavaScript and Vite; no ecommerce, backend, offers or inventory claims.

This is an unofficial design demonstration. Indexing stays disabled through
`noindex,nofollow` and a disallow-all robots file. It is not an authorized business website.

## Candidate for review

Branch: `work/visual-reconstruction`, based on
`072ca503bedf20060a20e86ab22c729e054aa4c5`.

The supplied [approved homepage](reference/approved-homepage.png) is the visual authority.
See [the reconstruction report](reference/RECONSTRUCTION.md) for the visual decisions,
verification evidence and remaining differences. Candidate pushes do not trigger the
Pages workflow, which is limited to pushes on main. Do not merge or dispatch deployment
until the candidate has been reviewed.

## Run and verify

- `npm ci` — install locked dependencies.
- `npm run dev` — Vite development server on port 5199.
- `npm run build` — static production output in dist/.
- `npm run smoke` — existing 50-check static gate.
- `npm run verify:browser` — existing 51-check Edge browser gate and screenshots.
- `npm run verify:visual` — extra widths, motion controls, no-JS navigation and print checks.
- `npm run og` — regenerate the neutral Open Graph image from its HTML template.

Browser checks require Microsoft Edge, driven by the existing playwright-core dependency.
The deployment base remains /vnm-kirbyville-preview/. Screenshots are written to
artifacts/screenshots/; pre-rebuild screenshots are retained locally in artifacts/baseline/.

## Business facts

[src/data/store.js](src/data/store.js) remains the source of truth. Name and city/state
are available. Street address, phone, hours, review profile and social URLs remain null
and unverified. The map link is a name-and-city search, not a claimed storefront pin.
No reviews, ratings, inventory, prices or social profiles have been invented.
The description was updated to remove the old inventory wording.

The closing greeting, “Take care. Have a blessed day.”, follows the user's report of the
owner's customary greeting. It is not a customer testimonial or an assertion of religion.
The user's report of a Facebook page is not sufficient to invent its URL.

## Structure

- index.html: semantic page, accessible navigation, factual information and greeting.
- src/styles/: tokens, shared styles, section composition and responsive layouts.
- src/scripts/main.js: verified business-data hydration and enhancement boot.
- src/scripts/motion.js: menu, reveals and slow, fading canvas atmosphere.
- public/assets/east-texas-landscape.svg: original decorative regional illustration.
- src/assets/og-template.html: factual social-preview source.
- vite.config.js: existing token replacement, Pages base and indexing assets.
- .github/workflows/deploy-pages.yml: existing main-only Pages deployment.

All content remains available without JavaScript. Reduced-motion users receive the same
static layout and illustration; the smoke is disabled. A pause control is available to
other users. Animation stops when the hero is offscreen or the tab is hidden.

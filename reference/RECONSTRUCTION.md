# Visual reconstruction — candidate review

## Verified starting point

- Local main and remote main: `072ca503bedf20060a20e86ab22c729e054aa4c5`.
- Created `work/visual-reconstruction` from that commit.
- The only initial untracked file was the user's supplied PNG. It remains untouched.
- `reference/approved-homepage.png` was initially missing. Copied the supplied PNG to
  that path, opened it, and inspected its 1055 × 1491 composition before rebuilding.
- Rendered the original production build: 51 browser checks passed. Baseline screenshots
  are retained locally under `artifacts/baseline/`.
- Original desktop page: 1440 × 5184. Small wordmark, isolated framed hero, small category
  icons, large section gaps and tall contact/footer sections departed from the reference.
- Pages workflow and Vite configuration inspected. Deployment is triggered by main;
  this work does not merge main or dispatch the deployment workflow.

## Visual system and implementation

The approved image is the blueprint: large wordmark, two-line left-aligned heading,
atmospheric right-hand composition, five visual cards, forest band with four columns,
three review panels, split location band and compact footer.

Palette: near-black blue-green surfaces, warm muted landscape light, white headings,
turquoise accents. Reference proportions guide desktop layouts; mobile uses a single
hero column, two-column information/fact grids, a full-width fifth card and stacked reviews.
Headings use a bold system sans serif; body uses the existing self-hosted Space Grotesk.
The serif closing greeting provides a quiet personal detail.

Core contrast pairs, calculated using relative sRGB luminance:

| Text / surface | Contrast |
| --- | ---: |
| #f4f6f7 / #061016 | 17.72:1 |
| #c3cfd5 / #101f24 | 10.62:1 |
| #42e8c6 / #061016 | 12.43:1 |
| #031a18 / #29cbb0 | 8.81:1 |
| #c0d6db / #304448 | 6.79:1 |

Spacing uses a 4px rhythm; measured card widths, image aspect ratios and responsive
headline sizes are deliberate exceptions to follow the supplied composition.

The component tree is static semantic HTML: header/navigation, main sections, footer.
Each section owns its layout. `store.js` owns business facts; `main.js` hydrates only
verified details. `motion.js` owns menu state, active navigation, reveals and smoke state.
There is no server, framework, transaction flow or remote content dependency.

Assets are a local WOFF2 font, original SVG landscape, inline icons, CSS and small ES
modules. Font preload and display-swap are preserved. The large approved PNG and
candidate screenshots stay outside public/ and are not part of the deployed page.

## Motion

Slow smoke provides the requested continuity across the top, fading at the hero edge.
Soft filaments are rendered into reusable sprites once; frames only composite them.
The existing 30fps cap, mobile particle reduction, DPR cap, offscreen and hidden-tab
pause behavior remain. This deliberately retains the existing low-cost atmosphere
instead of imposing the motion skill's generic 60fps preference.

An accessible Pause/Resume atmosphere control is provided. Reduced motion clears the
canvas; live preference changes work in both directions. The same typography, landscape
and hierarchy remain without motion. Primary hero content is readable on first paint.
Existing progressive scroll reveals remain on the lower cards, with no-JS and print
fallbacks. Hover feedback changes color; nothing moves or flashes to encourage purchase.

## Factual content and personal detail

Merchandise imagery and inventory claims became business-information cards. Promotional
headlines, price claims and fabricated reviews were removed. Review panels describe
verification status without names, ratings or testimonials. Map geometry is illustrative,
labelled as a city-level reference; the external link remains a name-and-city Maps search.

`src/data/store.js` is preserved as the source of truth. Its only change is a neutral
site description replacing inventory language. All business fields and verification
flags remain unchanged. No address, phone, hours, social profile or review URL was invented.
The original noindex/nofollow policy, robots output and 404 behavior are preserved.

“Take care. Have a blessed day.” follows the user's report of the owner's greeting.
It is a closing salutation, not a testimonial, product endorsement or religious identity
claim. No cross or unverified Facebook URL was added.

## Verification and evidence

All final commands completed successfully after the last visual changes:

| Command | Result |
| --- | --- |
| `npm run build` | Pass |
| `npm run smoke` | 50 passed, 0 failed |
| `npm run verify:browser` | 51 passed, 0 failed |
| `npm run verify:visual` | Pass: extra widths and five interaction/fallback checks |
| `git diff --check` | Pass |

Existing smoke and browser verification scripts were not modified or weakened.
The supplemental script checks 320/1055/1920px overflow and headline wrapping, pause/resume,
live reduced-motion settings, print visibility, navigation without JS and Escape focus.
Original browser checks cover 360/390/430/768/1024/1440px, asset/console/page errors,
navigation, skip link, menu behavior, actual canvas painting and reduced motion, and 404s.

Committed screenshots:

- [Desktop — 1440px](candidate/desktop-1440.png)
- [Mobile — 390px](candidate/mobile-390.png)
- [Reference-width comparison — 1055px](candidate/reference-width-1055.png)
- [Additional measurements](candidate/visual-evidence.json)

All full screenshots, including 320/360/430/768/1024/1920px, menu, no-JS and hero details,
remain locally in `artifacts/screenshots/`. Desktop and mobile screenshots were visually
inspected. Repairs included shorter desktop bands, larger wordmark, clearer forest
silhouettes, removal of review-mark/text collisions and deliberate mobile card flow.

The final 1440px page is 2254px tall versus the baseline's 5184px.
At the reference width, the candidate is 1729px tall versus the approved image's 1491px:

| Band | Reference, approximately | Candidate |
| --- | ---: | ---: |
| Hero/header | 444 | 460 |
| Five cards | 283 | 294 |
| About/landscape | 219 | 227 |
| Review information | 220 | 243 |
| Location | 207 | 231 |
| Contact/greeting | — | 120 |
| Footer | 118 | 155 |

## Performance and remaining differences

Production JS: 8.80 KB (3.50 KB gzip). CSS: 26.27 KB (7.17 KB gzip).
Landscape SVG: 37,663 bytes (6,300 bytes gzip), with reused tree shapes.
No new dependency. Gzip figures describe compressibility; server compression is hosting-dependent.
Target budgets are JS <15 KB gzip, first-page local assets <200 KB uncompressed, and
stable layout with fixed illustration proportions. No lab or field LCP/CLS score is claimed.

This is a reconstruction, not a pixel-identical reproduction. The main intentional
differences are regional vector artwork instead of merchandise photography, informational
cards instead of products, review-status panels instead of stars/quotes, and the additional
contact/greeting band. There is no fabricated water-tower photograph or storefront image.
The exact reference typeface was not supplied; available typefaces approximate its hierarchy.
The reference has no mobile layout, so mobile composition is independently designed.

Changed files: index.html; the four token/component/section/responsive stylesheets;
main.js and motion.js; neutral description in store.js; OG template and generated image;
new landscape SVG; package.json and supplemental verify-visual.js; README and reference
documentation; approved reference copy and candidate screenshot/evidence files.

Skills applied: Developer's Way, premium aesthetic language, component composition and
motion choreography. The approved image and explicit scope serve as the design blueprint;
the model-training web-builder pipeline does not apply to this static-site task.

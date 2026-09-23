# Homepage art direction — execution record

Baseline: `b7b8cf92531f531e3aad829077ae441cdb54e1f0`, branch `work/fidelity-correction`.
Implementation branch: `work/homepage-art-direction`. Main/Pages remain unchanged.

## Audit before UI editing

Rendered and inspected the complete existing page at 1440px and 390px. Opened all
33 supplied image files on three labelled contact sheets, including extensionless
files. Inspected file signatures for all 46 source-folder/reference files: no actual
video was supplied. Two `shaka-player` downloads are JavaScript, not video media.
Sources remain unchanged. Detailed per-file decisions are in `MEDIA-INVENTORY.json`.

The current sunset appears in the location tile and both about/location backgrounds.
The five thumbnail cards use a store thumbnail, sunset, stock clock, telephone and
door. The review area repeats three near-identical placeholder boxes. The hero
headline overlays the building; the generic image treatment overwhelms the small
amount of factual information. Mobile stretches this repetition into a long stack.

## Visual plan recorded before implementation

- Hero: preserve the approved dusk asset without editing the building. Offset the
  photograph to the right in a larger scene; left typography overlaps its dark edge,
  with restrained amber details, a distinct address caption and a static wordmark.
  Keep the existing environmental motion independent of merchandise/branding.
- Utility strip: one continuous dark surface, five divided cells, custom 24px line
  icons, verified daily hours, call, directions, Kirbyville identity and 21+ notice.
  On narrow screens use deliberate grid wrapping, with at least 44px controls.
- Interior gallery: three distinct environmental views after excluding similar wall
  shots, one centered and two partial
  neighbors. Shuffle once with Fisher–Yates; sequential 6-second rotation after that.
  Previous/next, pagination, drag/swipe, keyboard controls and a modal large view.
  Pause on hover, keyboard entry and manual input; never auto-start in reduced motion.
- Hometown: one use of the selected sunset alongside a quiet typographic treatment
  of the owner's reported greeting. No unverified service, quality or trust claims.
- Reviews: one editorial source block linking to the supplied Google profile,
  replacing the three empty testimonial-like cards. No invented/borrowed reviews.
- Visit: a bold address placard and aligned contact/hours details. Real outbound
  directions; no fictional map pin, embedded widget or recycled scenery.
- Footer: restrained identity, navigation and existing preview disclosures.

The requested merchandise promotions, product-category advertising and smoke from
paraphernalia forming the brand are excluded. This work completes the permissible
factual design and engineering scope, not those parts of the requested concept.

## Implementation contract

Static semantic HTML owns all content. Existing Vite token replacement owns facts
and deployment URLs. `gallery.js` owns shuffled order, active slide, user pause and
dialog state. Existing `motion.js` owns the ambient canvas and navigation. A new
media manifest owns source IDs, filenames, captions and dimensions. No framework,
runtime dependency, API, backend or analytics is introduced.

Hero is the only eagerly loaded photograph. Interior images and hometown image are
lazy loaded, sized explicitly and self-hosted. Keep JS below 25 KB uncompressed and
initial page transfer below 500 KB; these are implementation budgets, not lab/device
performance scores. Gallery transitions use transform/opacity; preserve the existing
30fps bounded atmospheric canvas. Reduced motion has the complete static layout,
manual gallery navigation and working dialog. No-JS gets all images in a static rail.

## Research applied

- [WAI carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/): pause
  control first, stop on focus/hover, no focus jumps during navigation, manual restart.
- [WAI carousel tutorial](https://www.w3.org/WAI/tutorials/carousels/): meaningful
  structure, keyboard operation, understandable slide state and user-controlled motion.
- [MDN modal dialogs](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal):
  native modal top layer and inert background, Escape close and focus restoration.

## Verification

Implemented, rendered, inspected and corrected the factual homepage. The unchanged
approved dusk file is now a framed, asymmetric hero scene with a separate address
caption, serif hierarchy and restrained amber/teal accents. The prior five thumbnail
cards are replaced by one continuous utility strip. Stock clock, telephone and door
illustrations are no longer used. The repeated sunset backgrounds are gone.

The gallery uses one DOM element per unique photograph, with no cloned slides. It
shuffles once and moves through that fixed order every six seconds, with a dominant
center photograph and partial neighbors. Manual input and focus pause until explicit
resume; hover pauses temporarily. Offscreen/hidden-tab work stops. Reduced motion
disables automatic rotation while retaining manual navigation. Real image links work
without JavaScript. The native dialog closes with Escape and restores opener focus.

### Media accounting

| Inventory / use | Count |
| --- | ---: |
| Supplied image files found and visually inspected | 33 |
| Supplied video files found | 0 |
| Distinct images actually used on the homepage | 5 |
| Gallery images used | 3 |
| Videos used | 0 |

The five page images are the approved dusk derivative, three distinct supplied interior
views, and the previously selected local sunset. The 33-file raw inventory separately
includes four Google interface graphics, 19 merchandise-focused files (including one
byte-identical duplicate), two similar wall views, one small exterior thumbnail, one
roadside image, one editor screenshot, one storefront concept export, one design
reference and the three gallery sources. Every file has a decision and reason in the
[inventory](MEDIA-INVENTORY.json); there is no claim that 33/33 files were used.

The raw storefront export is represented by its approved dusk derivative, not repeated
as another gallery image. The older phone screenshot and alternate-size copies are
excluded. The user-selected local image appears only in the hometown section. The
gallery's three image hashes are unique and the five primary page image sources are
unique. There are no photographic CSS backgrounds bypassing that audit.

### Verification results

- `npm run build`: passed; JS 13.49 KB / 4.99 KB gzip, CSS 27.78 KB / 7.54 KB gzip.
- `npm run smoke`: 52 passed, 0 failed.
- `npm run verify:browser`: 52 passed, 0 failed.
- `npm run verify:visual`: passed, including environmental motion, pause, reduced
  motion, offscreen suspension, print visibility and no-JS navigation.
- `npm run verify:gallery`: 16 passed, including coverage, hash/source deduplication,
  stable rotation order, mouse dragging, actual CDP touch swipes, preserved vertical
  scrolling, keyboard controls, pause semantics and dialog focus restoration.
- `git diff --check`: passed. Both updated project skills passed validation.
- Manually inspected full-page renders at 1440, 1024, 768, 430 and 390px. Additional
  automated widths: 320, 360, 1055 and 1920px. No horizontal page overflow.

Corrections made during QA: preserved the pause button's pointer intent across focus
entry; suppressed native link dragging; hid clipped neighboring slide captions; kept
telephone touch targets at least 44px; gave the informative Texas SVG an accessible
name. The live media-preference test now waits for the asynchronous browser change
event before asserting state. Assertions were not removed to hide failures.

The old smoke assertion requiring three placeholder review boxes was replaced with
the new semantic contract: a source-labelled review section, real supplied listing
link, explicit reproduction status, and no unverified review-rating schema. All other
static/browser checks remain. This is a deliberate content redesign, not a gate bypass.

### Rendered evidence

- [1440 desktop](art-direction/desktop-1440.png)
- [1024 desktop](art-direction/desktop-1024.png)
- [768 tablet](art-direction/tablet-768.png)
- [430 mobile](art-direction/mobile-430.png)
- [390 mobile](art-direction/mobile-390.png)
- [Gallery behavior and media evidence](art-direction/gallery-evidence.json)
- [Additional visual measurements](art-direction/visual-evidence.json)
- [Local URL, revision and resource measurements](art-direction/local-evidence.json)

Before renders and all three labelled media contact sheets remain under ignored
`artifacts/art-direction/`. Raw supplied media and downloaded page support files were
not modified, executed or broadly imported. The existing hero asset's Git blob hash
matches the baseline: `89b5daeae7b5abff2fa2743f4dc9453648a200ec`.

### Remaining differences / limits

The requested promotional category displays and glass-to-smoke-to-brand composition
are not implemented. The existing ambient smoke remains environmental; the wordmark
is static. This is not completion of those parts of the requested commercial concept.
No claims about product quality, trust, selection or customer ratings were added.

The approved storefront is still an edited concept, identified as such in alt text and
the footer. The building was not edited in this pass. Two gallery originals are only
91 × 91 and 141 × 101; they remain visibly soft when enlarged. The third is 680 × 510.
No invented detail, generated merchandise or fake enhancement was used to conceal
those source limits. The local photo's existing source/reuse caveats in `ARTWORK.md`
still apply. No playable videos were present; player JavaScript files are not videos.

### Changed files and infrastructure

Page: `index.html`; shared/section/responsive styles; `src/scripts/main.js`;
`src/scripts/gallery.js`; `src/data/media.js`; three `public/assets/store/*` files;
`vite.config.js` (static gallery token); `src/scripts/smoke.js` (review contract);
`src/scripts/verify-gallery.js`; `package.json` (one verification command); README;
this report, the media inventory and screenshots; the reference-fidelity and
preview-review project skills.

`src/data/store.js`, package dependencies/lockfile, Pages workflow, deployment base,
noindex/nofollow policy and existing URLs remain unchanged. Local review URL:
`http://127.0.0.1:4187/vnm-kirbyville-preview/`, marker `hometown-local-v5`.
Main remains `75f02de02d7e6d7c0a0d156190dfa0ec0ee465cb`; no deployment was triggered.

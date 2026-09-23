# Reference reconstruction — published revision

The user explicitly authorized replacing the existing live site on September 23, 2026.
The prior unpublished vector candidate is superseded by this photographic reconstruction.
The publication target remains https://anonymousnomad.github.io/vnm-kirbyville-preview/.

## Reference and composition

Inspected reference: [approved-homepage.png](approved-homepage.png), 1055 × 1491 pixels.
It is a byte-for-byte copy of the user's supplied image, SHA-256
CA4B5ECE18DAC9A7AD7B16CDA0272E62658F5CE34C6A5638B8CB7A2B16216723.
The starting main commit was 072ca503bedf20060a20e86ab22c729e054aa4c5.

The reference governs the edge-to-edge photographic hero, wood/teal/amber lighting,
large wordmark and two-line headline, five photo cards, forest band, three review panels,
location band and footer. All text and controls are semantic HTML. The page is not a
screenshot with hotspots. The previous vector landscape and floating plaque were removed.

At 1055px width, the rendered sections measure:

| Section | Reference, approximately | Reconstruction |
| --- | ---: | ---: |
| Header/hero | 444 | 444 |
| Five cards | 283 | 287 |
| About/forest | 219 | 219 |
| Reviews | 220 | 224 |
| Location | 207 | 215 |
| Footer | 118 | 172 |

Total: 1562px versus 1491px. The footer retains factual contact status, the requested
“Take care. Have a blessed day.” greeting, and the preview/illustration notices.
No mobile reference exists: mobile gets stacked hero content, a 2-column card grid,
stacked review panels, large touch targets and an accessible collapsible navigation.

## Content boundaries and remaining differences

Promotional merchandise, invented testimonials and ratings from the supplied image
are replaced with neutral environmental photography and factual business-information
panels. Generated photographs are atmospheric illustrations, not pictures of the business.
The unlettered water tower is fictional scenery, not an assertion about a real landmark.
[ARTWORK.md](ARTWORK.md) contains the exact prompts and workspace asset locations.
The typeface hierarchy is matched with available system sans serif and self-hosted
Space Grotesk rather than an unidentified font inferred from the raster reference.

The verified name/city, business-data module, null unverified facts, map-search fallback,
noindex/nofollow policy and static Vite/Pages architecture are preserved. There are no
invented phone numbers, addresses, hours, inventory claims, prices, ratings or social URLs.
No ecommerce, backend, dependency addition or transactional flow was introduced.

## Motion and accessibility

Slow canvas haze fades at the top and lower hero edge. Static photographic haze supplies
atmosphere when animation is disabled. Pause/resume, live reduced-motion changes,
offscreen/tab visibility suspension, reduced mobile particle count and the 30fps cap
remain. Header navigation now calculates document-relative positions correctly even
for the contact block nested in the footer. Skip link, keyboard menu operation, Escape
focus restoration, no-JS navigation and print visibility remain functional.

## Verification

- npm run build: passed.
- npm run smoke: 50 passed, 0 failed.
- npm run verify:browser: 51 passed, 0 failed.
- npm run verify:visual: extra widths, motion controls, print/no-JS behavior passed.
- git diff --check: passed.

Widths: 320, 360, 390, 430, 768, 1024, 1055, 1440, 1920px.
Existing static and browser checks were not weakened or modified.
Desktop/reference-width and mobile renders were visually inspected and spacing repaired.

Evidence: [desktop](candidate/desktop-1440.png), [mobile](candidate/mobile-390.png),
[reference width](candidate/reference-width-1055.png),
[measurements](candidate/visual-evidence.json). More screenshots remain locally under
artifacts/screenshots/. Live deployment evidence is saved locally under artifacts/live/.

## Static delivery

Production JavaScript: 8.83 KB (3.50 KB gzip). CSS: 23.20 KB (6.58 KB gzip).
The three WebP images total 341,488 bytes. The photo-based design uses a revised
first-page local-asset budget of 500 KB uncompressed; large source PNGs and verification
screenshots are excluded from the Vite output. The revised budget accommodates the
photographic reference rather than the superseded vector-only design. No lab/field
Core Web Vitals score is claimed.

Changed in this revision: index.html; sections.css and responsive.css; active navigation
in motion.js; three WebP assets; removal of the unused vector forest; current screenshots;
README, this report and artwork provenance. Pages workflow and deployment base remain
unchanged. Publication uses a normal main-branch update after all local checks pass.

# Source and visual research — 2026-09-23

## Exact business

The user supplied https://share.google/CHdy1QkwX52be3h7a . A local Edge inspection followed its redirect to a Google search for **Vape N More (Kirbyville)** with entity ID `/g/11yv1dxz_g`. Google then presented an unusual-traffic/CAPTCHA page. No bypass was attempted. The research browser could not inspect photos, hours, address, phone or reviews. Local inspection evidence is under `artifacts/research/` (ignored; includes a network challenge page and is not a public artifact).

The link identifies the user's intended listing. It does not independently verify its contents. The user subsequently supplied a listing transcription and selected image files; these are recorded below rather than attributed to a successful live Google inspection.

### Supplied business details

On September 23, 2026, the user supplied **21034 US-96, Kirbyville, TX 75956**, **(409) 279-1126**, and **9 AM–9 PM every day**. These values are recorded in `src/data/store.js` with their source and date. Its verified flags mean project-owner-supplied confirmation, not an API feed. Static HTML, telephone links, address searches and JSON-LD use these fields; the indexing policy remains disabled.

The user also supplied a 5.0/58-review snapshot, anonymous excerpts and Google's AI summary. No rating, review count, excerpts or AI summary is reproduced as site content. The actual listing remains linked for external reading. No Facebook URL was supplied.

| Source | Finding | Decision |
| --- | --- | --- |
| [Southeast Texas directory](https://www.southeasttexasbusinessdirectory.com/category/retail-and-shopping) | Search result lists “vape n more kirbyville”, phone +1 409-279-1126 and a rating/count. The category page is dynamic; direct retrieval did not consistently reproduce the entry. | Secondary lead only. Published contact information is sourced to the later user transcription; the directory rating/count is excluded. |
| [Enigma directory](https://www.enigma.com/directory/tx/all-cities/vaporizer-store) | Lists Smoke N More in Kirbyville and other Vape N More stores elsewhere. | Similar names are not identity evidence. Excluded. |
| User's description of the owner | “Take care / have a blessed day” greeting. | Preserve the existing neutral greeting without inventing religious affiliation. |

No independent Google/API verification or Facebook URL was obtained. Supplied facts are distinguished from unresolved fields and outside research leads.

## Local photography candidates

- [Kirbyville, Texas, circa 1907](https://commons.wikimedia.org/wiki/File:Kirbyville,_Texas.jpg): SMU Libraries Digital Collections; the file page reports no known copyright restrictions. It is archival imagery, not a contemporary forest/town panorama; unsuitable for silently representing today's Kirbyville.
- [City of Kirbyville](https://cityofkirbyville.com/): primary local authority, but no clearly reusable scenic image was established from the inspected page.
- [Big Thicket Longleaf Pine Trail](https://home.nps.gov/thingstodo/hike-the-longleaf-pine-trail.htm): contemporary regional forest candidate credited NPS / Scott Sharaga. Inspect the exact asset and usage information before use. Label Big Thicket accurately; do not call it downtown Kirbyville or the store's surroundings.
- [NPS image usage example](https://www.nps.gov/media/photo/gallery-item.htm?gid=3B600859-D190-4967-9943-D7DF502E25F7&id=7894c9b1-95d1-4f86-a590-792aa53ad1c3): explains that NPS-credited images without a copyright symbol are public domain, while other credits need separate review. This particular controlled-burn photo is not suitable website scenery.

### Images selected and supplied by the user

- **Storefront:** `store inside/outside/ChatGPT Image Sep 23, 2026, 02_33_56 PM.png`, an exported, generated storefront concept supplied by the user. Inspected directly, then edited with the image tool to remove the right-side silver crate and pallets and apply a dusk grade. The website labels it an edited concept. It is not evidence of the store's actual appearance at dusk.
- **Interior:** `store inside/Kirbyville Texas smoke shops - Google Search_files/unnamed(18).jpg`, a small wide interior overview supplied for this project. Used only as a small factual thumbnail, not a merchandise showcase. The low-resolution source limits sharpness; original photographer/reuse provenance is not independently established.
- **Scenery:** the user's [background share link](https://share.google/mSOmS325fYWI0D8ay) resolved to an image from [The Calm of Kirbyville, Texas](https://minimallstorage.com/blogs/the-calm-of-kirbyville-texas-a-quiet-town-in-the-lone-star-state), dated March 13, 2024. The publisher labels it a Kirbyville sunset. The 700 × 393 image is used in this local candidate's scenic bands and location card at the user's direction. Independent geolocation and an open reuse license have not been established; do not call it public domain or an owner original.
- Exact assets, hashes and the final image-edit prompt are in [ARTWORK.md](ARTWORK.md). Raw user folders and downloaded Google page scripts remain untracked and are not executed or deployed.

## Design and engineering decisions

The supplied raster is the composition authority. External sources guide implementation behavior, not a new design.

| Primary source | Applicable finding | Implementation decision |
| --- | --- | --- |
| [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) | Motion should use elapsed timestamps rather than assume a display refresh rate. | CSS-pixel velocities, bounded delta and timestamp reset on resume. |
| [MDN canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) | Repeated drawing can be pre-rendered onto offscreen canvases. | Keep reusable smoke sprites and bounded particle count. |
| [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | Automatically moving content alongside other content needs user control under the criterion's conditions. | Preserve pause/resume and reduced-motion behavior. |
| [web.dev LCP optimization](https://web.dev/articles/optimize-lcp) | CSS background images are discovered later; a preload can expose the critical resource in the initial HTML. | Preload the optimized dusk storefront only. No performance score claimed without measurement. |
| [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) | API photos/reviews have attribution, source-access and storage requirements. | No API integration or scraped reviews. The user-supplied interior thumbnail has separate, unresolved photographer provenance; user selection is not evidence of a Google reuse license. |

## Visual comparison before the correction

Baseline: `75f02de02d7e6d7c0a0d156190dfa0ec0ee465cb`; `main` and `origin/main` agreed. Only the original user PNG was untracked. Reference was opened directly and compared with the committed 1055px render.

- Header logo/nav are lower than the reference; active underline is too low.
- Hero headline and paragraph sit slightly lower; button widths differ substantially.
- The five-card band and review band each add about 4px; location adds about 8px.
- Location panel starts near x584, versus x469 in the reference.
- Smoke has full-width distribution, extremely low upward velocity and accumulating sideways drift. It does not clearly read as a rising upper-left plume.
- Neutral hero/card imagery and factual copy differ materially from the reference's product advertising. Promotional nicotine displays, slogans and product-marketing cards are excluded from implementation; do not describe the resulting site as an exact match.

Publication authorization from the earlier conversation remains recorded in `RECONSTRUCTION.md`. The latest directive requests a correction to the existing implementation. No deployment configuration changes are required.

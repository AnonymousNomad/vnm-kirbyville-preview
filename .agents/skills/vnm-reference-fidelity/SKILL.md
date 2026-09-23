---
name: vnm-reference-fidelity
description: Correct the existing Vape N More Kirbyville preview against its approved reference, using measured desktop geometry and intentional mobile reflow.
---

# Kirbyville reference fidelity

Apply within this repository. Inspect `reference/approved-homepage.png` and the current render before editing. The image is 1055 by 1491 pixels; do not infer it from a written brief.

The latest full homepage direction supersedes the old section geometry below. Read `reference/ART-DIRECTION.md` and `reference/MEDIA-INVENTORY.json` first. Preserve the storefront-led layout, continuous utility strip, unique image roles and interior gallery; do not restore the five stock-photo cards or force the old band heights. The original measurements remain historical context only.

Keep the existing Vite implementation. At 1055px, the reference bands are approximately: hero 444px, cards 283px, scenic/about 219px, reviews 220px, location 207px, footer 118px. These are comparison targets, not fixed heights that may clip content. Left hero copy begins near x61; the location panel begins near x469. Keep the five-column desktop card rhythm and four-column scenic band.

Compare large shapes first: band boundaries, image crop, negative space, heading width and line height, then controls and borders. Retain semantic HTML; do not use the reference as an interactive full-page image. Never claim a full visual match while the imagery or content differs materially.

Business facts and links come from `src/data/store.js`. Preserve null/unverified fields, noindex/nofollow, mobile navigation, reduced motion, and deployment base. Keep the preview factual; document any requested content that cannot be implemented rather than silently substituting it and claiming acceptance.

For authorized verification, run build, smoke, browser and visual scripts without weakening assertions. Inspect screenshots at 1055 and 390px plus boundary widths. Freeze motion and wait for fonts for comparable screenshots; separately observe running motion. See `reference/RESEARCH.md` for source status and design evidence.

Preload the single hero image at high priority when useful; do not preload all imagery. The current hero is an actual `img` with dimensions and fetch priority. Source: [web.dev LCP resource discovery](https://web.dev/articles/optimize-lcp).

# Vape N More — Kirbyville, Texas · Website Preview

A location-specific website preview built as a client-acquisition demonstration for a
vape and smoke shop in Kirbyville, Texas.

**This is an unsolicited design preview, not an authorized business website.** Indexing
is intentionally disabled (`noindex,nofollow` + `robots.txt` disallow-all) so the
preview cannot compete with, impersonate, or outrank any existing business presence.

- Visual doctrine: dark East Texas atmosphere, premium smoke-shop retail, restrained
  cyan/teal neon, warm product lighting, subtle atmospheric vapor.
- Stack: semantic HTML5, custom CSS (design tokens), vanilla ES modules, Vite as the
  build tool only. No frameworks, no runtime dependencies.
- Output: fully static, GitHub Pages ready.

---

## Business-fact policy (read this first)

Every business fact lives in one module: [`src/data/store.js`](src/data/store.js).
A fact is rendered as established only when its `*Verified` flag is `true`. Until then
the field is `null` and the UI degrades to honest copy ("Call for current hours").

Currently **unverified** (intentionally omitted from the site and from JSON-LD):

| Fact | State | UI behaviour |
| --- | --- | --- |
| Street address | `streetAddress: null` | "Exact address pending verification" chip |
| Phone number | `phone: null` | No `tel:` link; "Call for current hours" |
| Hours | `hours: null` | "Call for current hours" |
| Google review URL | `reviewUrl: null` | Review cards stay neutral placeholders |
| Social profiles | `null` | Not rendered |

Verified and safe to render: display name (`Vape N More`), city/state
(`Kirbyville, Texas`). Directions use a Google Maps **search** built only from those two
verified facts — not an invented address or pin. Review cards are explicitly labelled
demo placeholders (`data-demo="true"`); no customer identities, quotes, or ratings are
fabricated.

### Activating production (after owner authorization)

1. Verify each fact with the owner; fill the value and set its `*Verified` flag in
   `src/data/store.js`.
2. Set `SITE.indexingEnabled = true` in the same file.
3. Rebuild. Robots meta, `robots.txt`, and `sitemap.xml` all flip from that one flag.

---

## Project structure

```text
vnm-kirbyville-preview/
├── index.html                  # single-page site (semantic DOM)
├── 404.html                    # styled not-found page
├── vite.config.js              # base path + token replacement + robots/sitemap emit
├── package.json
├── reference/                  # visual authority notes (mockup was not supplied)
├── public/
│   ├── favicon.svg
│   ├── site.webmanifest
│   └── assets/
│       ├── fonts/space-grotesk-latin-var.woff2   # self-hosted, 22 KB, latin subset
│       └── og-image.png                          # generated: npm run og
├── src/
│   ├── data/store.js           # single source of truth for site + business facts
│   ├── scripts/
│   │   ├── main.js             # orchestrator: store hydration + module boot
│   │   ├── motion.js           # reveals, parallax, canvas vapor, mobile menu
│   │   ├── smoke.js            # static build gate (no browser)
│   │   ├── verify-browser.js   # real-browser verification (Edge via playwright-core)
│   │   └── og-image.js         # renders the Open Graph card
│   ├── assets/og-template.html # OG card source (not part of the site build)
│   └── styles/
│       ├── tokens.css          # palette, type scale, spacing, radii, motion
│       ├── base.css            # reset, shell, layout primitives, reveal system
│       ├── components.css      # buttons, header, nav, cards, panels, footer
│       ├── sections.css        # hero composition + atmospheric motion
│       └── responsive.css      # 360 / 390 / 430 / 768 / 1024 / 1440 ladder
└── .github/workflows/deploy-pages.yml
```

---

## Commands

```bash
npm ci                  # install (Vite + playwright-core only)
npm run dev             # dev server at http://localhost:5199/vnm-kirbyville-preview/
npm run build           # production build -> dist/
npm run smoke           # static gate: metadata, assets, facts, a11y structure
npm run verify:browser  # real-browser sweep (Edge) + screenshots -> artifacts/
npm run verify          # build + smoke + browser sweep
npm run og              # regenerate public/assets/og-image.png
npm run preview         # serve the built site at http://localhost:4187/vnm-kirbyville-preview/
```

CI runs `npm ci && npm run build && npm run smoke` on every push to `main`, then
publishes `dist/` to GitHub Pages. The browser sweep is a local gate because it needs a
real browser binary.

---

## What the verification proves

- **Static gate** (`npm run smoke`): required files exist; no unreplaced build tokens;
  robots policy matches the store config; canonical/OG/Twitter metadata complete; JSON-LD
  parses and contains **no unverified facts**; single `h1`; skip link; landmarks; menu
  `aria-expanded`/`aria-controls`; every `href="#…"` resolves to a real id; external
  links carry `rel="noopener"`; no fake `tel:` while the phone is unverified; no invented
  street address; no absolute pricing claims; 21+ and nicotine notices present; preview
  attribution present; demo-labelled review cards; every local asset reference resolves
  inside `dist/`; CSS font URL is rebased correctly.
- **Browser gate** (`npm run verify:browser`): 200 + zero horizontal overflow + rendered
  hero + **headline rendering in exactly two lines** + all reveal animations firing +
  zero console/page errors at 360/390/430/768/1024/1440; desktop nav navigation; mobile
  menu open/Escape/link-close with `aria-expanded`; 44 px touch target; skip link appears
  on first Tab; every button has an accessible name; reduced-motion renders instantly with
  animations disabled and the vapor canvas blank; custom 404 returns status 404 with a
  base-correct home link.

The `--fs-h1` clamp was not guessed: the rendered width of the longest headline line was
measured in Edge at every breakpoint (`617px @ 69.6px` → ratio `≈8.87`), and the clamp was
solved so the approved two-line headline fits its column at every supported width with
margin to spare. The two-line assertion above keeps that true.

## Accessibility notes

Semantic landmarks, one `h1`, skip link, visible focus rings, keyboard-operable menu with
Escape-to-close and focus return, `aria-current` on the active nav item, decorative SVGs
`aria-hidden`, informative SVGs named via `aria-labelledby`, and a full
`prefers-reduced-motion` path (no reveals, no float, no pulse, no canvas).

## Performance notes

Zero runtime dependencies; one 22 KB self-hosted font (preloaded); inline SVG artwork
instead of raster images; canvas vapor capped at 30 fps, 26 particles desktop / 12 mobile,
DPR capped at 1.5, paused when the tab is hidden or the hero is off-screen. Only
`favicon.svg`, `site.webmanifest`, `robots.txt`, and `sitemap.xml` are static extras.

---

## Legal / scope

- 21+ only. Valid government-issued ID required for purchase. Nicotine is an addictive
  chemical. In-store shopping only — this site sells nothing online.
- No ecommerce, accounts, backend, or third-party integrations are present by design;
  those are possible paid extensions after client acquisition.
- This repository is an unofficial design demonstration and is not affiliated with,
  endorsed by, or operated by any existing business entity.

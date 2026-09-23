# Local correction review

## Scope and ownership

Existing HTML/CSS/Vite page, no redesign or new application framework. `src/data/store.js` owns facts and URLs; `motion.js` owns animation and menu state; styles own responsive presentation; Vite substitutes values into static HTML. No backend, purchase flow, login, analytics, form submission, third-party runtime widget or API key is needed.

The user now requests local review first. Earlier public deployment authorization remains historical context; this candidate must not replace the live site before review.

## Risks and verification

| Area / failure | Control | Evidence to collect |
| --- | --- | --- |
| Wrong store or invented facts | User transcription recorded with date; unknown fields remain null; verification flags gate values | 52 static checks; `RESEARCH.md` |
| Misleading or incompletely sourced imagery | Label edited storefront concept; record user-selected sources without claiming an open license | `ARTWORK.md`; publication review remains necessary |
| Motion hides content or causes discomfort | Separate decorative canvas; low opacity; pause, live reduced motion, no-JS readable content | Running/paused frames and browser checks |
| Motion moves sideways or disappears after resizing | Timestamp-driven upward speed; bounded drift; re-paint frozen frame on resize | Upward displacement and left-side concentration checks |
| Excess drawing work | 30fps target; 26 desktop/12 mobile sprites; DPR caps; hidden/offscreen suspension | Bounded draw count and offscreen checks; no unmeasured performance score |
| Reference geometry drifts | Same-size desktop comparison; inspect band boundaries, title scale, panel alignment | 1055px reference and candidate side by side |
| Mobile overflow or trapped navigation | Mobile reflow, 44px menu, Escape focus, no-JS navigation | 320–1920px coverage, keyboard/mobile checks |
| Third-party script compromise or tracking | Self-hosted assets; plain outbound links; no new runtime dependencies | Inspect built requests and errors |
| Local candidate accidentally replaces live site | Feature branch; loopback preview; existing Pages workflow unchanged | Git status, local URL and live revision marker |
| Browser screenshots mistaken for working features | Run motion separately from frozen screenshots; preserve all checks | Build, smoke, browser, visual logs |

## Research behind the controls

- [W3C minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): preserve readable text against the darkest photographic layer. Inspect the entire animated area, not just one background sample.
- [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): react to the preference both initially and when it changes.
- [MDN page visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): suspend decorative work when the document is hidden.
- [OWASP third-party JavaScript](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html): third-party scripts introduce code-control and data-disclosure risks; this static page has no need for them.
- Timestamp, canvas, LCP and Google-source references are in [RESEARCH.md](RESEARCH.md).

## Dependencies and acceptance limits

Keep the current Vite and Playwright Core setup and lockfile. Python is only used to validate developer skill frontmatter; it is not a site dependency. No packages added for visual effects.

The source photograph's promotional merchandise, claims and testimonials are not reproduced. The requested smoke-to-brand animation is excluded; ambient background motion remains separate from the readable static name. A successful engineering pass does not mean the user's full visual target has been achieved.

Address, phone and daily hours have now been supplied by the user. The storefront export is a generated concept; the interior overview is very low resolution. Outstanding inputs for a future publication review are original full-resolution business photography with reuse provenance and any real Facebook URL. The selected scenic photograph's open reuse rights have not been established. Do not infer unresolved details from similarly named directory results.

Current evidence: build passed; 52 static checks and 52 browser checks passed; visual checks passed across the combined nine widths. See [CORRECTION.md](CORRECTION.md) for the measurements and local screenshots. Main and the live deployment remain at the prior revision.

---
name: vnm-rising-atmosphere
description: Adjust and verify the Kirbyville preview's subtle rising hero smoke without adding animation dependencies or compromising motion accessibility.
---

# Kirbyville rising atmosphere

Use the existing `initVapor` in `src/scripts/motion.js`. Smoke belongs mainly along the left hero edge, rising into the upper-left negative space and fading before it leaves the canvas. Preserve text contrast and the warm photographic background. Avoid saturated purple haze and full-screen fog.

Express velocity in CSS pixels per second using the requestAnimationFrame timestamp. Cap long deltas after stalls; reset the timestamp on resume. Bound lateral movement around an origin rather than accumulating drift indefinitely. Pre-render filaments into small reusable sprites; no per-frame filters, new libraries, video download or WebGL renderer for this effect.

Keep the 30fps/DPR/mobile-particle budgets. Stop work when hidden or offscreen. Pause must freeze the frame without holding focus; reduced motion must suppress drawing initially and after a live preference change. Keep the static background usable without JavaScript.

When verification is requested, inspect running frames several seconds apart. Check upward displacement, left-side concentration, fading, pause/resume, and live reduced-motion changes. A changing canvas checksum alone does not prove rising smoke. Instrument draw calls only in the test browser, not the production API.

Primary references: [MDN timestamps](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [MDN canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), [W3C pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

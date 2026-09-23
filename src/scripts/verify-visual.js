/** Supplemental reconstruction checks. Existing verification gates remain intact. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright-core';
import { SITE } from '../data/store.js';

const root = resolve(import.meta.dirname, '../..');
const shots = resolve(root, 'artifacts/screenshots');
mkdirSync(shots, { recursive: true });
const server = await preview({ root, preview: { host: '127.0.0.1', port: 4189, strictPort: true } });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const evidence = { widths: [], checks: [], measurements: {} };
const url = `http://127.0.0.1:4189${SITE.base}`;
try {
  for (const width of [320, 1055, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const failures = [];
    page.on('pageerror', e => failures.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      sections: [...document.querySelectorAll('main>section,footer')].map(el => ({
        id: el.id || 'footer', y: Math.round(el.getBoundingClientRect().y), height: Math.round(el.getBoundingClientRect().height),
      })),
      headingLines: Math.round(document.querySelector('h1').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight)),
    }));
    assert(metrics.contentWidth <= width, `${width}px overflow`);
    assert.equal(metrics.headingLines, 2, `${width}px headline`);
    assert.deepEqual(failures, []);
    await page.screenshot({ path: resolve(shots, `${width}-visual.png`), fullPage: true });
    evidence.widths.push(width);
    evidence.measurements[width] = metrics;
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    // Observe actual canvas output without adding a production test interface.
    window.__smokeFrame = [];
    const originalClear = CanvasRenderingContext2D.prototype.clearRect;
    const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.hasAttribute('data-vapor-canvas')) window.__smokeFrame = [];
      return originalClear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.drawImage = function (...args) {
      if (this.canvas.hasAttribute('data-vapor-canvas')) {
        window.__smokeFrame.push({ x: args[1] + args[3] / 2, y: args[2] + args[4] / 2 });
      }
      return originalDraw.apply(this, args);
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  const firstFrame = await page.evaluate(() => window.__smokeFrame);
  assert(firstFrame.length > 0, 'Smoke produces visible draw calls');
  await page.screenshot({ path: resolve(shots, 'smoke-start-1440.png') });
  await page.waitForTimeout(3000);
  const secondFrame = await page.evaluate(() => window.__smokeFrame);
  assert.equal(secondFrame.length, firstFrame.length, 'Particle count stays bounded');
  const rise = firstFrame.reduce((sum, p, i) => sum + p.y - secondFrame[i].y, 0) / firstFrame.length;
  assert(rise > 12 && rise < 65, `Expected visible gradual upward travel, observed ${rise}px`);
  assert(secondFrame.filter(p => p.x < 1440 / 3).length / secondFrame.length > 0.7, 'Most smoke stays near the left edge');
  await page.screenshot({ path: resolve(shots, 'smoke-after-3s-1440.png') });
  evidence.checks.push('Visible upward smoke travel', 'Left-edge smoke concentration');
  evidence.smokeRisePixelsOver3s = Math.round(rise * 100) / 100;
  const snapshot = () => page.locator('[data-vapor-canvas]').evaluate(c => c.toDataURL());
  const toggle = page.locator('[data-motion-toggle]');
  await toggle.click();
  const paused = await snapshot();
  await page.waitForTimeout(400);
  assert.equal(await snapshot(), paused, 'Pause freezes the smoke');
  await toggle.click();
  await page.waitForTimeout(400);
  assert.notEqual(await snapshot(), paused, 'Resume animates smoke');
  await page.locator('#location').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const offscreen = await snapshot();
  await page.waitForTimeout(400);
  assert.equal(await snapshot(), offscreen, 'Offscreen smoke suspends drawing');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  assert.notEqual(await snapshot(), offscreen, 'Visible smoke resumes drawing');
  evidence.checks.push('Offscreen suspension and return');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  assert(await toggle.isHidden(), 'Reduced motion hides redundant pause control');
  assert(await page.locator('[data-vapor-canvas]').evaluate(c => !c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some(Boolean)), 'Reduced motion clears smoke');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(400);
  assert(await toggle.isVisible());
  assert(await page.locator('[data-vapor-canvas]').evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some(Boolean)), 'Smoke restarts after live preference change');
  evidence.checks.push('Pause/resume', 'Live reduced-motion changes');
  await page.emulateMedia({ reducedMotion: 'reduce', media: 'print' });
  assert.equal(await page.locator('[data-reveal]').evaluateAll(els => els.filter(e => getComputedStyle(e).opacity === '0').length), 0);
  evidence.checks.push('Print reveals visible');
  await page.close();

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await nojs.newPage();
  await staticPage.goto(url, { waitUntil: 'networkidle' });
  assert(await staticPage.locator('#site-nav').isVisible());
  await staticPage.locator('#site-nav a[href="#contact"]').click();
  assert(staticPage.url().endsWith('#contact'));
  assert.equal(await staticPage.locator('h1').count(), 1);
  await staticPage.screenshot({ path: resolve(shots, '390-no-js.png'), fullPage: true });
  evidence.checks.push('Mobile navigation and static content without JavaScript');
  await nojs.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await mobile.locator('[data-menu-toggle]').click();
  await mobile.screenshot({ path: resolve(shots, '390-menu.png') });
  await mobile.keyboard.press('Escape');
  assert(await mobile.locator('[data-menu-toggle]').evaluate(e => e === document.activeElement));
  evidence.checks.push('Escape restores mobile toggle focus');
  await mobile.close();
  writeFileSync(resolve(root, 'artifacts/visual-evidence.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  console.log('VISUAL VERIFICATION PASSED');
} finally {
  await browser.close();
  await new Promise(r => server.httpServer.close(r));
}

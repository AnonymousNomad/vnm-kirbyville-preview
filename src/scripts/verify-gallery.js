/** Gallery behavior and exact media coverage against the production build. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright-core';
import { STORE_MEDIA } from '../data/media.js';
import { SITE } from '../data/store.js';
import { shuffleOnce } from './gallery.js';

const root = resolve(import.meta.dirname, '../..');
const evidence = { checks: [], pageImages: [], galleryImages: STORE_MEDIA.length, videos: 0 };
const check = async (name, run) => { await run(); evidence.checks.push(name); console.log(`PASS ${name}`); };
const server = await preview({ root, preview: { host: '127.0.0.1', port: 4191, strictPort: true } });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const url = `http://127.0.0.1:4191${SITE.base}`;
const shots = resolve(root, 'artifacts/art-direction');
mkdirSync(shots, { recursive: true });
try {
  await check('Shuffle is a non-mutating permutation, with reproducible forward order', () => {
    const ids = STORE_MEDIA.map(m => m.id);
    const order = shuffleOnce(ids, () => 0);
    assert.deepEqual([...order].sort(), [...ids].sort());
    assert.notDeepEqual(order, ids);
    assert.deepEqual(ids, STORE_MEDIA.map(m => m.id));
    assert.notDeepEqual(shuffleOnce(ids, () => .999), order);
  });
  await check('Every intended gallery source is present once, with unchanged bytes', () => {
    const inventory = JSON.parse(readFileSync(resolve(root, 'reference/MEDIA-INVENTORY.json')));
    const selected = inventory.assets.filter(m => m.disposition === 'gallery');
    assert.equal(STORE_MEDIA.length, selected.length);
    assert.equal(new Set(STORE_MEDIA.map(m => m.sha256)).size, STORE_MEDIA.length);
    for (const entry of STORE_MEDIA) {
      assert(selected.some(m => m.id === entry.sourceId));
      const actual = createHash('sha256').update(readFileSync(resolve(root, 'public', entry.src))).digest('hex');
      assert.equal(actual, entry.sha256);
    }
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('[data-gallery-stage]').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const gallery = page.locator('[data-gallery]');
  const active = () => gallery.getAttribute('data-active-id');
  const order = await page.locator('[data-media-id]').evaluateAll(els => els.map(e => e.dataset.mediaId));
  await check('Static page uses five unique images; no repeated prominent backgrounds', async () => {
    const srcs = await page.locator('main img[src]').evaluateAll(els => els.map(e => new URL(e.src).pathname));
    assert.equal(srcs.length, 5);
    assert.equal(new Set(srcs).size, srcs.length);
    assert.equal(srcs.filter(s => s.endsWith('storefront-dusk.webp')).length, 1);
    assert.equal(srcs.filter(s => s.endsWith('kirbyville-sunset.webp')).length, 1);
    const cssImages = await page.locator('main *').evaluateAll(els => els.flatMap(el => ['', '::before', '::after'].map(p => getComputedStyle(el, p || null).backgroundImage)).filter(s => s.includes('url(')));
    assert.deepEqual(cssImages, [], 'Unexpected CSS background photograph bypasses media audit');
    assert.equal(await page.locator('.info-card,.review-card').count(), 0);
    evidence.pageImages = srcs;
  });
  await check('All selected gallery images rendered once, with contain sizing and lazy loading', async () => {
    assert.deepEqual([...order].sort(), STORE_MEDIA.map(m => m.id).sort());
    const images = await page.locator('[data-media-id] img').evaluateAll(els => els.map(e => ({ fit: getComputedStyle(e).objectFit, lazy: e.loading, loaded: e.complete && e.naturalWidth > 0, alt: e.alt })));
    assert(images.every(i => i.fit === 'contain' && i.lazy === 'lazy' && i.loaded && i.alt));
    assert.equal(await page.locator('video').count(), 0);
  });
  await check('Automatic rotation advances once through the initialized order', async () => {
    const initial = await active();
    await page.waitForTimeout(6400);
    assert.equal(await active(), order[(order.indexOf(initial) + 1) % order.length]);
  });
  await check('Hover pauses rotation', async () => {
    await page.locator('[data-gallery-stage]').hover();
    const before = await active();
    assert.equal(await gallery.getAttribute('data-rotation'), 'paused');
    await page.waitForTimeout(6250);
    assert.equal(await active(), before);
    await page.mouse.move(0, 0);
  });
  await check('Pause button remains paused after pointer focus and mouse leave', async () => {
    await page.locator('[data-gallery-play]').click();
    await page.mouse.move(0, 0);
    assert.equal(await gallery.getAttribute('data-rotation'), 'paused');
    assert.equal(await page.locator('[data-gallery-play]').textContent(), 'Play rotation');
  });
  await check('Next/previous wrap without reshuffling and manual interaction stays paused', async () => {
    let expected = order.indexOf(await active());
    for (let i = 0; i < order.length * 2; i++) {
      await page.locator('[data-gallery-next]').click();
      expected = (expected + 1) % order.length;
      assert.equal(await active(), order[expected]);
    }
    await page.locator('[data-gallery-prev]').click();
    expected = (expected - 1 + order.length) % order.length;
    assert.equal(await active(), order[expected]);
    await page.mouse.move(0, 0);
    const manual = await active();
    await page.waitForTimeout(6250);
    assert.equal(await active(), manual);
    assert.deepEqual(await page.locator('[data-media-id]').evaluateAll(els => els.map(e => e.dataset.mediaId)), order);
  });
  await check('Keyboard arrows, pagination and active-slide accessibility stay aligned', async () => {
    await page.locator('[data-gallery-stage]').focus();
    await page.keyboard.press('Home');
    assert.equal(await active(), order[0]);
    await page.keyboard.press('ArrowRight');
    assert.equal(await active(), order[1]);
    await page.locator('[data-gallery-pagination] button').last().click();
    assert.equal(await active(), order.at(-1));
    assert.equal(await page.locator('[data-media-id][aria-hidden="false"]').count(), 1);
    assert.equal(await page.locator('[data-gallery-pagination] [aria-current="true"]').count(), 1);
    assert.equal(await page.locator('[data-media-id][inert]').count(), STORE_MEDIA.length - 1);
  });
  await check('Desktop dragging advances without triggering native link dragging or a lightbox', async () => {
    const box = await page.locator('[data-gallery-stage]').boundingBox();
    const before = await active();
    await page.mouse.move(box.x + box.width / 2 + 70, box.y + 110);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 90, box.y + 110, { steps: 12 });
    await page.mouse.up();
    assert.notEqual(await active(), before);
    assert(await page.locator('[data-lightbox]').isHidden());
    await page.waitForTimeout(400);
  });
  await check('Lightbox opens, closes with Escape and restores focus', async () => {
    await page.waitForTimeout(650);
    const opener = page.locator('.gallery-slide.is-active [data-gallery-open]');
    await opener.click();
    assert(await page.locator('[data-lightbox]').isVisible());
    assert.equal(await page.locator('[data-lightbox-image]').getAttribute('alt'), await opener.locator('img').getAttribute('alt'));
    await page.screenshot({ path: resolve(shots, 'lightbox.png') });
    await page.keyboard.press('Escape');
    assert(await page.locator('[data-lightbox]').isHidden());
    assert(await opener.evaluate(e => document.activeElement === e));
  });
  await check('Explicit resume works; offscreen suspends and focus entry stops', async () => {
    await page.locator('[data-gallery-play]').click();
    await page.mouse.move(0, 0);
    assert.equal(await gallery.getAttribute('data-rotation'), 'running');
    await page.locator('#location').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    assert.equal(await gallery.getAttribute('data-rotation'), 'paused');
    await page.locator('[data-gallery-stage]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    assert.equal(await gallery.getAttribute('data-rotation'), 'running');
    await page.locator('[data-gallery-stage]').focus();
    assert.equal(await gallery.getAttribute('data-rotation'), 'paused');
  });
  await check('Live reduced-motion preference disables automatic rotation', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Browser media-query change events arrive asynchronously after emulation.
    await page.waitForFunction(() => document.querySelector('[data-gallery-play]').disabled, null, { timeout: 1500 });
    assert(await page.locator('[data-gallery-play]').isDisabled());
    assert.equal(await gallery.getAttribute('data-rotation'), 'paused');
    const before = await active();
    await page.locator('[data-gallery-next]').click();
    assert.notEqual(await active(), before);
  });
  assert.deepEqual(errors, []);
  await page.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const touch = await mobile.newPage();
  await touch.goto(url, { waitUntil: 'networkidle' });
  await check('Initial reduced motion starts with automatic rotation disabled', async () => {
    assert(await touch.locator('[data-gallery-play]').isDisabled());
    assert.equal(await touch.locator('[data-gallery]').getAttribute('data-rotation'), 'paused');
  });
  await touch.locator('[data-gallery-stage]').scrollIntoViewIfNeeded();
  await check('Real touch swipe advances one slide and preserves vertical page scrolling', async () => {
    const box = await touch.locator('[data-gallery-stage]').boundingBox();
    const x = box.x + box.width * .7, y = box.y + 100;
    const client = await mobile.newCDPSession(touch);
    const before = await touch.locator('[data-gallery]').getAttribute('data-active-id');
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 5; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 25, y }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.notEqual(await touch.locator('[data-gallery]').getAttribute('data-active-id'), before);
    assert(await touch.locator('[data-lightbox]').isHidden());
    const afterSwipe = await touch.locator('[data-gallery]').getAttribute('data-active-id');
    const scrollBefore = await touch.evaluate(() => scrollY);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 5; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 20 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.waitForTimeout(300);
    assert.equal(await touch.locator('[data-gallery]').getAttribute('data-active-id'), afterSwipe);
    assert(await touch.evaluate(() => scrollY) > scrollBefore);
    await client.detach();
  });
  await mobile.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.goto(url, { waitUntil: 'networkidle' });
  await check('Without JavaScript, every photo remains accessible via a real image link', async () => {
    assert.equal(await nojs.locator('[data-media-id]').count(), STORE_MEDIA.length);
    assert.equal(await nojs.locator('[data-gallery-controls]:not([hidden])').count(), 0);
    const links = await nojs.locator('[data-gallery-open]').evaluateAll(els => els.map(e => e.getAttribute('href')));
    assert.deepEqual(links.sort(), STORE_MEDIA.map(m => SITE.base + m.src).sort());
    await nojs.locator('[data-gallery-open]').first().click();
    assert(nojs.url().includes('/assets/store/'));
  });
  await nojs.close();
  writeFileSync(resolve(shots, 'gallery-evidence.json'), JSON.stringify(evidence, null, 2));
  console.log(`GALLERY VERIFICATION PASSED — ${evidence.checks.length} checks`);
} finally {
  await browser.close();
  await new Promise(r => server.httpServer.close(r));
}

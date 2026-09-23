/**
 * verify-browser.js — real-browser verification against the production build.
 *
 * Serves dist/ at the real deployment base path, then drives Microsoft Edge
 * (via playwright-core) through:
 *   - responsive sweeps at 360 / 390 / 430 / 768 / 1024 / 1440
 *   - horizontal-overflow, console-error, and page-error detection
 *   - reveal + navigation + mobile-menu + keyboard functionality
 *   - reduced-motion behaviour
 *   - 404 handling
 * Screenshots land in artifacts/screenshots/ as evidence.
 *
 *   node src/scripts/verify-browser.js
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { join, normalize, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { SITE, STORE, contactHref, directionsHref, addressDisplay, hoursDisplay } from '../data/store.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = join(root, 'dist');
const shotsDir = join(root, 'artifacts', 'screenshots');

let passed = 0;
const failures = [];

/** Async-aware assertion wrapper: never let a promise masquerade as a pass. */
async function check(label, fn) {
  try {
    const result = await fn();
    if (result === false) throw new Error('assertion returned false');
    passed += 1;
    console.log(`  PASS  ${label}`);
  } catch (error) {
    failures.push(`${label} — ${error.message}`);
    console.log(`  FAIL  ${label} — ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const pathname = decodeURIComponent(url.pathname);

      const notFound = async () => {
        res.writeHead(404, { 'content-type': MIME['.html'] });
        res.end(await readFile(join(dist, '404.html')));
      };

      if (!pathname.startsWith(SITE.base)) return notFound();

      let rel = pathname.slice(SITE.base.length);
      if (rel === '' || rel.endsWith('/')) rel += 'index.html';

      const full = normalize(join(dist, rel));
      if (!full.startsWith(dist) || !existsSync(full)) return notFound();

      const body = await readFile(full);
      res.writeHead(200, { 'content-type': MIME[extname(full)] ?? 'application/octet-stream' });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end(String(error));
    }
  });

  return new Promise((resolvePromise) => {
    server.listen(0, '127.0.0.1', () => {
      resolvePromise({ server, port: server.address().port });
    });
  });
}

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
];

async function main() {
  if (!existsSync(dist)) {
    console.error('dist/ missing — run "npm run build" first.');
    process.exit(1);
  }
  mkdirSync(shotsDir, { recursive: true });

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}${SITE.base}`;
  console.log(`\nvnm browser verification — ${baseUrl}\n`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (error) {
    console.error(`Could not launch Microsoft Edge via playwright-core: ${error.message}`);
    console.error('Install Edge or adjust the channel in src/scripts/verify-browser.js.');
    server.close();
    process.exit(1);
  }

  try {
    /* ------------------------- responsive sweep ------------------------- */
    for (const vp of VIEWPORTS) {
      console.log(`\nviewport ${vp.name}`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const response = await page.goto(baseUrl, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1100);

      await check(`${vp.name} responds 200`, () => {
        assert(response?.status() === 200, `status ${response?.status()}`);
      });

      await check(`${vp.name} no horizontal overflow`, async () => {
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          return {
            doc: doc.scrollWidth - doc.clientWidth,
            body: body.scrollWidth - body.clientWidth,
          };
        });
        assert(overflow.doc <= 1 && overflow.body <= 1, `doc +${overflow.doc}px / body +${overflow.body}px`);
      });

      await check(`${vp.name} hero headline rendered`, async () => {
        const text = await page.locator('h1').innerText();
        assert(text.includes('Kirbyville'), `h1 text was "${text.slice(0, 40)}"`);
      });

      // Art-direction gate: the approved headline is two lines. Font sizes were
      // measured against rendered text width (see README) — this keeps them honest.
      await check(`${vp.name} headline renders in exactly two lines`, async () => {
        const lines = await page.locator('h1').evaluate((el) => {
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.04;
          return Math.round(el.getBoundingClientRect().height / lh);
        });
        assert(lines === 2, `headline wrapped to ${lines} lines`);
      });

      await check(`${vp.name} all reveals fire after scroll-through`, async () => {
        // Instant scrolling on purpose: the site uses scroll-behavior: smooth for
        // users, which would make programmatic scrollTo calls animate and lag.
        await page.evaluate(async () => {
          const doc = document.documentElement;
          const previous = doc.style.scrollBehavior;
          doc.style.scrollBehavior = 'auto';
          const step = window.innerHeight * 0.7;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 70)));
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
          doc.style.scrollBehavior = previous;
        });
        await page.waitForTimeout(900);
        const hidden = await page.evaluate(
          () => document.querySelectorAll('[data-reveal]:not(.is-visible)').length,
        );
        assert(hidden === 0, `${hidden} reveal elements never became visible`);
      });

      await check(`${vp.name} no console/page errors`, () => {
        assert(consoleErrors.length === 0, `console: ${consoleErrors.join(' | ')}`);
        assert(pageErrors.length === 0, `pageerror: ${pageErrors.join(' | ')}`);
      });

      await page.screenshot({ path: join(shotsDir, `${vp.name}.png`), fullPage: true });
      await context.close();
    }

    /* --------------------------- desktop function ----------------------- */
    console.log('\ndesktop function (1440x900)');
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(900);

      await check('nav links exist for every section', async () => {
        const hrefs = await page
          .locator('[data-nav-link]')
          .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
        for (const id of ['#home', '#products', '#about', '#reviews', '#location', '#contact']) {
          assert(hrefs.includes(id), `missing nav link ${id}`);
        }
      });

      // Must run on a fresh document: focus must start at <body> for Tab order
      // to be meaningful. (Clicking anything first invalidates this test.)
      await check('skip link is the first tab stop and becomes visible', async () => {
        await page.goto(baseUrl, { waitUntil: 'load' });
        await page.waitForTimeout(400);
        await page.keyboard.press('Tab');
        // the skip link slides in over 180ms — measure after the transition settles
        await page.waitForTimeout(400);
        const state = await page.evaluate(() => {
          const el = document.activeElement;
          const rect = el.getBoundingClientRect();
          return { cls: String(el.className), top: rect.top, visible: rect.top >= 0 };
        });
        assert(state.cls.includes('skip-link'), `focus went to ${state.cls}`);
        assert(state.visible, 'skip link stayed off-screen');
      });

      await check('contact CTA does not fake a tel: link', async () => {
        const href = await page.locator('[data-contact-href]').first().getAttribute('href');
        assert(href === contactHref(), `expected verified-data target ${contactHref()}, got ${href}`);
      });

      await check('directions link targets a real maps search with rel=noopener', async () => {
        const tag = await page.locator('[data-directions-href]').first().evaluate((el) => el.outerHTML);
        assert(tag.includes('google.com/maps/search'), 'directions URL is not a maps search');
        assert(tag.includes('rel="noopener'), 'missing rel=noopener');
        assert(tag.includes('target="_blank"'), 'missing target=_blank');
        assert(await page.locator('[data-directions-href]').first().getAttribute('href') === directionsHref(), 'maps query differs from verified data');
      });
      await check('contact and location display the supplied business details', async () => {
        assert(await page.locator('[data-phone-value]').textContent() === STORE.phone, 'phone value mismatch');
        assert(await page.locator('[data-store-hours]').last().textContent() === hoursDisplay(), 'hours value mismatch');
        assert(await page.locator('[data-store-address-value]').textContent() === addressDisplay(), 'address value mismatch');
      });

      await check('every button has an accessible name', async () => {
        const unnamed = await page.evaluate(
          () =>
            Array.from(document.querySelectorAll('button')).filter((b) => {
              const label = (b.getAttribute('aria-label') ?? '') + b.textContent.trim();
              return label.length === 0;
            }).length,
        );
        assert(unnamed === 0, `${unnamed} unnamed buttons`);
      });

      await check('atmosphere canvas is painting and animating', async () => {
        const sample = () =>
          page.evaluate(() => {
            const canvas = document.querySelector('[data-vapor-canvas]');
            if (!canvas || !canvas.width) return { nonZero: 0, sum: 0 };
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            let nonZero = 0;
            let sum = 0;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] !== 0) nonZero += 1;
              sum += data[i];
            }
            return { nonZero, sum };
          });
        const first = await sample();
        await page.waitForTimeout(800);
        const second = await sample();
        assert(first.nonZero > 1000, `canvas nearly empty (${first.nonZero} non-zero alpha bytes)`);
        assert(first.sum !== second.sum, 'canvas is not animating between samples');
      });

      // Fresh document again, then verify real navigation by click.
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(600);

      await check('clicking Products navigates to the section', async () => {
        await page.locator('[data-nav-link][href="#products"]').first().click();
        await page.waitForTimeout(1100);
        assert(page.url().endsWith('#products'), `url is ${page.url()}`);
        const top = await page.locator('#products').evaluate((el) => el.getBoundingClientRect().top);
        assert(top > -80 && top < 220, `section top at ${Math.round(top)}px`);
      });

      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      await page.screenshot({ path: join(shotsDir, 'hero-1440.png') });
      // section evidence: scroll it in and wait for the reveal transition to settle
      await page.locator('#location').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      await page.locator('#location').screenshot({ path: join(shotsDir, 'location-1440.png') });

      await context.close();
    }

    /* ---------------------------- mobile menu --------------------------- */
    console.log('\nmobile menu (390x844)');
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(shotsDir, 'hero-390.png') });

      await check('menu toggle meets the 44px touch target', async () => {
        const box = await page.locator('[data-menu-toggle]').boundingBox();
        assert(box && box.width >= 44 && box.height >= 44, `toggle is ${box?.width}x${box?.height}`);
      });

      await check('menu opens, reports state, and closes on Escape', async () => {
        const toggle = page.locator('[data-menu-toggle]');
        await toggle.click();
        await page.waitForTimeout(400);
        assert((await toggle.getAttribute('aria-expanded')) === 'true', 'aria-expanded not true after open');
        assert(await page.locator('#site-nav').isVisible(), 'nav not visible after open');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        assert((await toggle.getAttribute('aria-expanded')) === 'false', 'aria-expanded not false after Escape');
      });

      await check('menu link navigates and closes the panel', async () => {
        const toggle = page.locator('[data-menu-toggle]');
        await toggle.click();
        await page.waitForTimeout(350);
        await page.locator('#site-nav a[href="#products"]').click();
        await page.waitForTimeout(900);
        assert(page.url().endsWith('#products'), `url is ${page.url()}`);
        assert((await toggle.getAttribute('aria-expanded')) === 'false', 'menu stayed open');
      });

      await context.close();
    }

    /* --------------------------- reduced motion ------------------------- */
    console.log('\nreduced motion (1440x900)');
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(600);

      await check('content is visible immediately (no reveal hiding)', async () => {
        const hidden = await page.evaluate(
          () => document.querySelectorAll('[data-reveal]:not(.is-visible)').length,
        );
        assert(hidden === 0, `${hidden} elements hidden under reduced motion`);
      });

      await check('stage float animation is disabled', async () => {
        const name = await page.locator('.stage').evaluate((el) => getComputedStyle(el).animationName);
        assert(name === 'none', `animation-name is ${name}`);
      });

      await check('vapor canvas is not painting', async () => {
        const painted = await page.evaluate(() => {
          const canvas = document.querySelector('[data-vapor-canvas]');
          if (!canvas) return 'missing';
          if (canvas.width === 0 || canvas.height === 0) return 'unsized';
          const ctx = canvas.getContext('2d');
          const data = ctx.getImageData(0, 0, Math.min(40, canvas.width), Math.min(40, canvas.height)).data;
          return data.some((v) => v !== 0) ? 'painting' : 'blank';
        });
        assert(painted === 'blank' || painted === 'unsized', `canvas state: ${painted}`);
      });

      await context.close();
    }

    /* -------------------------------- 404 ------------------------------- */
    console.log('\n404 handling');
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}does-not-exist/`, { waitUntil: 'load' });
      await check('unknown path returns 404 with the styled page', async () => {
        assert(response?.status() === 404, `status ${response?.status()}`);
        const text = await page.locator('body').innerText();
        assert(text.includes('Back to the main page'), 'custom 404 content missing');
      });
      await check('404 home link points at the deployment base', async () => {
        const href = await page.locator('a.home').getAttribute('href');
        assert(href === SITE.base, `expected ${SITE.base}, got ${href}`);
      });
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  console.log(`screenshots: ${shotsDir}\n`);
  if (failures.length) {
    console.error('BROWSER VERIFICATION FAILED:');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('BROWSER VERIFICATION PASSED');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

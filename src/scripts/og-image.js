/**
 * og-image.js — renders public/assets/og-image.png (1200x630) from the
 * art-directed template using the self-hosted font, via Microsoft Edge.
 * Regenerate with: npm run og
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const templatePath = join(root, 'src', 'assets', 'og-template.html');
const fontPath = join(root, 'public', 'assets', 'fonts', 'space-grotesk-latin-var.woff2');
const outPath = join(root, 'public', 'assets', 'og-image.png');

const template = readFileSync(templatePath, 'utf8');
const fontB64 = readFileSync(fontPath).toString('base64');
const html = template.replace('%FONT_B64%', fontB64);

const tmpHtml = join(tmpdir(), `vnm-og-${Date.now()}.html`);
writeFileSync(tmpHtml, html, 'utf8');

mkdirSync(dirname(outPath), { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`wrote ${outPath}`);
} finally {
  await browser.close();
  rmSync(tmpHtml, { force: true });
}

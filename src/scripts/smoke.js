/**
 * smoke.js — static production-build gate.
 * Runs against dist/ and fails loudly on anything that would ship broken.
 * No browser required: this is the fast gate; verify-browser.js is the slow one.
 *
 *   node src/scripts/smoke.js
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, STORE, hasVerifiedPhone, canonicalUrl, robotsMeta } from '../data/store.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = join(root, 'dist');

let passed = 0;
const failures = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) throw new Error('assertion returned false');
    passed += 1;
    console.log(`  PASS  ${label}`);
  } catch (error) {
    failures.push(`${label} — ${error.message}`);
    console.log(`  FAIL  ${label} — ${error.message}`);
  }
}

function read(relPath) {
  const full = join(dist, relPath);
  if (!existsSync(full)) throw new Error(`missing file: ${relPath}`);
  return readFileSync(full, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log(`\nvnm smoke gate — dist: ${dist}\n`);

if (!existsSync(dist)) {
  console.error('dist/ does not exist — run "npm run build" first.');
  process.exit(1);
}

/* ------------------------------ required files --------------------------- */
console.log('files');
for (const rel of [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'favicon.svg',
  'site.webmanifest',
  'assets/fonts/space-grotesk-latin-var.woff2',
]) {
  check(`dist/${rel} exists`, () => {
    assert(existsSync(join(dist, rel)), `missing dist/${rel}`);
    assert(statSync(join(dist, rel)).size > 0, `dist/${rel} is empty`);
  });
}

const html = read('index.html');
const notFound = read('404.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const manifest = read('site.webmanifest');

/* --------------------------------- tokens -------------------------------- */
console.log('\nbuild tokens');
check('no unreplaced %TOKEN% markers in index.html', () => {
  const leftover = html.match(/%[A-Z_]+%/g);
  assert(!leftover, `leftover tokens: ${leftover?.join(', ')}`);
});
check('no unreplaced %TOKEN% markers in 404.html', () => {
  const leftover = notFound.match(/%[A-Z_]+%/g);
  assert(!leftover, `leftover tokens: ${leftover?.join(', ')}`);
});
check('no TODO / Lorem ipsum placeholders', () => {
  assert(!/TODO|Lorem ipsum/i.test(html), 'placeholder text found');
});

/* ------------------------------ indexing policy -------------------------- */
console.log('\nindexing policy (preview)');
check(`robots meta is "${robotsMeta()}"`, () => {
  const meta = html.match(/<meta name="robots" content="([^"]+)"/);
  assert(meta, 'robots meta missing');
  assert(meta[1] === robotsMeta(), `expected ${robotsMeta()}, got ${meta[1]}`);
});
check('robots.txt disallows all when indexing disabled', () => {
  if (SITE.indexingEnabled) {
    assert(/^Allow: \/$/m.test(robots), 'indexing enabled but robots.txt does not allow');
  } else {
    assert(/^Disallow: \/$/m.test(robots), 'indexing disabled but robots.txt does not disallow');
  }
});
check('canonical URL is absolute and matches config', () => {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert(canonical, 'canonical link missing');
  assert(canonical[1] === canonicalUrl(), `expected ${canonicalUrl()}, got ${canonical[1]}`);
});

/* ---------------------------------- SEO ---------------------------------- */
console.log('\nSEO + social');
check('title is descriptive', () => {
  const title = html.match(/<title>([^<]+)<\/title>/);
  assert(title, 'title missing');
  assert(title[1].length > 20 && title[1].includes('Kirbyville'), 'title too short or off-topic');
});
check('meta description present', () => {
  const desc = html.match(/<meta name="description" content="([^"]+)"/);
  assert(desc && desc[1].length > 50, 'description missing or too short');
});
for (const prop of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
  check(`Open Graph ${prop} present`, () => {
    assert(html.includes(`property="${prop}"`), `missing ${prop}`);
  });
}
check('twitter card present', () => {
  assert(html.includes('name="twitter:card"'), 'twitter:card missing');
  assert(html.includes('name="twitter:image"'), 'twitter:image missing');
});
check('JSON-LD parses and contains no unverified facts', () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, 'JSON-LD missing');
  const data = JSON.parse(match[1]);
  assert(data['@type'] === 'LocalBusiness', 'expected LocalBusiness schema');
  assert(data.name === STORE.name, 'schema name mismatch');
  assert(!data.address, 'schema contains an address but none is verified');
  assert(!data.telephone, 'schema contains a telephone but none is verified');
  assert(!data.openingHours, 'schema contains hours but none are verified');
  assert(data.areaServed?.name?.includes('Kirbyville'), 'schema areaServed missing Kirbyville');
});
check('sitemap.xml is well-formed with one URL', () => {
  assert(sitemap.includes('<urlset'), 'urlset missing');
  const locs = sitemap.match(/<loc>/g) ?? [];
  assert(locs.length === 1, `expected 1 <loc>, found ${locs.length}`);
  assert(sitemap.includes(canonicalUrl()), 'sitemap does not contain canonical URL');
});
check('web manifest is valid JSON', () => {
  const data = JSON.parse(manifest);
  assert(data.name && data.theme_color, 'manifest missing name/theme_color');
});

/* ------------------------------- structure ------------------------------- */
console.log('\nstructure + accessibility');
check('html lang declared', () => assert(/<html lang="[a-z-]+"/i.test(html), 'lang missing'));
check('exactly one h1', () => {
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  assert(h1s.length === 1, `found ${h1s.length} h1 elements`);
});
check('skip link present and targets #main', () => {
  assert(/class="skip-link" href="#main"/.test(html), 'skip link missing');
  assert(html.includes('id="main"'), '#main missing');
});
for (const id of ['home', 'products', 'about', 'reviews', 'location', 'contact']) {
  check(`section #${id} exists`, () => assert(html.includes(`id="${id}"`), `#${id} missing`));
}
check('semantic landmarks present', () => {
  assert(html.includes('<header'), 'header missing');
  assert(html.includes('<main'), 'main missing');
  assert(html.includes('<footer'), 'footer missing');
  assert((html.match(/<nav /g) ?? []).length >= 2, 'expected at least 2 nav landmarks');
});
check('menu toggle has accessible state', () => {
  assert(/data-menu-toggle/.test(html), 'toggle missing');
  assert(/aria-expanded="false"/.test(html), 'aria-expanded missing');
  assert(/aria-controls="site-nav"/.test(html), 'aria-controls missing');
});
check('decorative svg is aria-hidden, informative svg has a name', () => {
  const roleImgs = html.match(/<svg[^>]*role="img"[^>]*>/g) ?? [];
  assert(roleImgs.length > 0, 'expected at least one informative svg');
  for (const tag of roleImgs) {
    assert(/aria-labelledby=|aria-label=/.test(tag), `svg role=img without accessible name: ${tag}`);
  }
});
check('all anchor targets exist (no dead # links)', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const dead = anchors.filter((a) => !ids.has(a));
  assert(dead.length === 0, `dead anchors: ${[...new Set(dead)].join(', ')}`);
});
check('external links carry rel=noopener', () => {
  const externals = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
  assert(externals.length > 0, 'expected at least one external directions link');
  for (const tag of externals) {
    assert(/rel="noopener/.test(tag), `external link without rel=noopener: ${tag}`);
  }
});

/* ----------------------------- business facts ---------------------------- */
console.log('\nbusiness-fact safety');
check('no fake tel: link while phone is unverified', () => {
  if (!hasVerifiedPhone()) {
    assert(!/href="tel:/.test(html), 'tel: link present but phone is unverified');
  }
});
check('phone slot renders honest fallback copy', () => {
  if (!hasVerifiedPhone()) {
    assert(html.includes('Call for current hours'), 'fallback copy missing');
  }
});
check('no invented street address', () => {
  assert(!/\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|hwy|highway)\b/i.test(html), 'possible street address found');
});
check('no absolute pricing claims', () => {
  assert(!/lowest price|cheapest|guaranteed lowest/i.test(html), 'unsupported absolute claim found');
});
check('21+ notice present in footer', () => {
  assert(html.includes('21+'), '21+ notice missing');
  assert(/addictive chemical/i.test(html), 'nicotine warning missing');
});
check('preview attribution present', () => {
  assert(/unofficial design demonstration/i.test(html), 'preview attribution missing');
});
check('reviews are labelled as demo content', () => {
  const demos = (html.match(/data-demo="true"/g) ?? []).length;
  assert(demos >= 3, `expected >=3 demo-labelled review cards, found ${demos}`);
  assert(/Awaiting verification/.test(html), 'review placeholder label missing');
});

/* --------------------------- asset path integrity ------------------------ */
console.log('\nasset integrity');
check('all local asset references resolve inside dist', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  const local = refs.filter((ref) => ref.startsWith(SITE.base));
  assert(local.length > 0, 'no base-prefixed asset references found');
  const missing = [];
  for (const ref of local) {
    const rel = ref.slice(SITE.base.length).split(/[?#]/)[0];
    if (!rel) continue;
    if (!existsSync(join(dist, rel))) missing.push(ref);
  }
  assert(missing.length === 0, `unresolved: ${missing.join(', ')}`);
});
check('404.html home link points at the deployment base', () => {
  assert(notFound.includes(`href="${SITE.base}"`), `expected href="${SITE.base}"`);
});
check('built CSS references the self-hosted font at the right base path', () => {
  const cssFiles = [...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]);
  assert(cssFiles.length > 0, 'no stylesheet referenced');
  const css = cssFiles
    .map((ref) => read(ref.slice(SITE.base.length)))
    .join('\n');
  assert(css.includes(`${SITE.base}assets/fonts/space-grotesk-latin-var.woff2`), 'font URL not rebased correctly in CSS');
});
check('script bundle referenced and present', () => {
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  assert(scripts.length > 0, 'no script bundle referenced');
  for (const ref of scripts) {
    assert(existsSync(join(dist, ref.slice(SITE.base.length))), `missing bundle ${ref}`);
  }
});

/* ---------------------------------- report ------------------------------- */
console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length) {
  console.error('SMOKE GATE FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('SMOKE GATE PASSED');

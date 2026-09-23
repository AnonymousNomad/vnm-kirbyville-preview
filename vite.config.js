import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, canonicalUrl, directionsHref, contactHref, robotsMeta, localBusinessJsonLd } from './src/data/store.js';

const root = dirname(fileURLToPath(import.meta.url));

/** Build-time token replacement so the static HTML stays correct without JS. */
function htmlTokens() {
  const buildDate = new Date().toISOString().slice(0, 10);
  const ogImage = `${SITE.origin}${SITE.base}${SITE.ogImage}`;
  const jsonLd = JSON.stringify(localBusinessJsonLd(canonicalUrl())).replace(/</g, '\\u003c');

  const tokens = {
    '%SITE_TITLE%': SITE.title,
    '%SITE_DESCRIPTION%': SITE.description,
    '%ROBOTS%': robotsMeta(),
    '%CANONICAL%': canonicalUrl(),
    '%BASE%': SITE.base,
    '%OG_IMAGE%': ogImage,
    '%OG_IMAGE_ALT%': SITE.ogImageAlt,
    '%THEME_COLOR%': SITE.themeColor,
    '%BUILD_DATE%': buildDate,
    '%JSONLD%': jsonLd,
    '%DIRECTIONS_URL%': directionsHref(),
    '%CONTACT_HREF%': contactHref(),
  };

  return {
    name: 'vnm-html-tokens',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let out = html;
        for (const [token, value] of Object.entries(tokens)) {
          out = out.split(token).join(value);
        }
        return out;
      },
    },
  };
}

/**
 * Emits robots.txt + sitemap.xml from store.js so the preview->production
 * indexing switch is exactly one boolean (SITE.indexingEnabled).
 */
function indexingAssets() {
  return {
    name: 'vnm-indexing-assets',
    writeBundle(options) {
      const dir = options.dir ?? resolve(root, 'dist');

      const robots = SITE.indexingEnabled
        ? `# ${SITE.name}\nUser-agent: *\nAllow: /\n\nSitemap: ${canonicalUrl()}sitemap.xml\n`
        : `# ${SITE.name}\n# PREVIEW DEPLOYMENT — indexing intentionally disabled.\n# Indexing is enabled only after owner authorization (see src/data/store.js).\nUser-agent: *\nDisallow: /\n`;
      writeFileSync(resolve(dir, 'robots.txt'), robots, 'utf8');

      const lastmod = new Date().toISOString().slice(0, 10);
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <url>\n    <loc>${canonicalUrl()}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
        `</urlset>\n`;
      writeFileSync(resolve(dir, 'sitemap.xml'), sitemap, 'utf8');
    },
  };
}

export default {
  base: SITE.base,
  plugins: [htmlTokens(), indexingAssets()],
  build: {
    target: 'es2020',
    cssTarget: 'chrome100',
    assetsInlineLimit: 2048,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        notFound: resolve(root, '404.html'),
      },
    },
  },
  server: {
    port: 5199,
    strictPort: true,
  },
};

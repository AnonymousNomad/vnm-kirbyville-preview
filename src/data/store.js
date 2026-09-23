/**
 * Vape N More — Kirbyville, Texas
 * Preview build: single source of truth for site + business facts.
 *
 * HARD RULE (see build brief, section 4):
 *   A fact may only be rendered as an established fact when its `*Verified`
 *   flag is true. Every unverified field must remain `null` here and the UI
 *   must degrade to honest, non-committal copy ("Call for current hours").
 *
 * To launch this site for the owner:
 *   1. Verify each business fact with the owner.
 *   2. Fill the value and set its flag to true.
 *   3. Flip `indexingEnabled` to true.
 *   Nothing else needs to change — the build derives robots meta, robots.txt,
 *   sitemap.xml, JSON-LD, and every CTA target from this module.
 */

/** Site-level (non-business) configuration. */
export const SITE = {
  name: 'Vape N More — Kirbyville Preview',
  shortName: 'Vape N More Kirbyville',
  origin: 'https://anonymousnomad.github.io',
  base: '/vnm-kirbyville-preview/',
  lang: 'en-US',
  themeColor: '#05070a',
  /**
   * PREVIEW INDEXING POLICY (build brief, section 5):
   * false -> robots meta "noindex,nofollow" + robots.txt disallow-all.
   * Flip to true only after owner authorization.
   */
  indexingEnabled: false,
  title: 'Vape N More — Kirbyville, Texas | Vape & Smoke Shop Preview',
  description:
    'An age-restricted business-information preview for Vape N More in Kirbyville, Texas. ' +
    'Location, contact details and verification status. For adults 21+.',
  ogImage: 'assets/og-image.png',
  ogImageAlt:
    'Dark, neon-lit preview artwork for a Kirbyville, Texas vape and smoke shop website.',
};

/**
 * Business facts. `null` = not verified = must not be presented as fact.
 */
export const STORE = {
  name: 'Vape N More',
  city: 'Kirbyville',
  state: 'Texas',
  stateCode: 'TX',
  country: 'US',

  // ---- Unverified fields (intentionally null until confirmed) ----
  streetAddress: null,
  streetAddressVerified: false,
  postalCode: null,
  postalCodeVerified: false,
  phone: null,
  phoneVerified: false,
  hours: null,
  hoursVerified: false,
  reviewUrl: null,
  reviewUrlVerified: false,
  social: {
    facebook: null,
    instagram: null,
    verified: false,
  },

  // ---- Derived / policy-safe values ----
  /**
   * Directions target. Until a street address is verified we use a Google Maps
   * *search query* built only from the two verified facts (name + city/state).
   * This is not an invented address or map pin; it resolves to whatever the
   * real listing is. Marked as a search fallback so it can be swapped for a
   * verified place link at launch.
   */
  directionsKind: 'maps-search-fallback',
};

const MAPS_SEARCH = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${STORE.name} ${STORE.city} ${STORE.stateCode}`,
)}`;

/** True when a verified, dialable phone number exists. */
export function hasVerifiedPhone() {
  return STORE.phoneVerified === true && typeof STORE.phone === 'string' && STORE.phone.length > 0;
}

/** True when a verified street address exists. */
export function hasVerifiedAddress() {
  return (
    STORE.streetAddressVerified === true &&
    typeof STORE.streetAddress === 'string' &&
    STORE.streetAddress.length > 0
  );
}

/**
 * Primary "Call / Contact" target.
 * Verified phone -> tel: link. Otherwise -> the on-page contact section.
 * Never a fake tel: target (build brief, section 17).
 */
export function contactHref() {
  return hasVerifiedPhone() ? `tel:${STORE.phone.replace(/[^\d+]/g, '')}` : '#contact';
}

/** Directions target: verified place link when available, else maps search. */
export function directionsHref() {
  return MAPS_SEARCH;
}

/** Display string for the phone slot, honest about verification state. */
export function phoneDisplay() {
  return hasVerifiedPhone() ? STORE.phone : 'Call for current hours';
}

/** Display string for the address slot, honest about verification state. */
export function addressDisplay() {
  if (hasVerifiedAddress()) {
    const cityLine = `${STORE.city}, ${STORE.stateCode}${STORE.postalCode ? ` ${STORE.postalCode}` : ''}`;
    return `${STORE.streetAddress} — ${cityLine}`;
  }
  return `${STORE.city}, ${STORE.state}`;
}

/** Display string for the hours slot, honest about verification state. */
export function hoursDisplay() {
  return STORE.hoursVerified && STORE.hours ? STORE.hours : 'Call for current hours';
}

/**
 * JSON-LD LocalBusiness template.
 * Only verified facts are emitted; unverified properties are omitted entirely
 * (build brief, section 16: never insert false schema values).
 */
export function localBusinessJsonLd(canonicalUrl) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: STORE.name,
    areaServed: {
      '@type': 'City',
      name: `${STORE.city}, ${STORE.stateCode}`,
    },
  };
  if (hasVerifiedAddress()) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: STORE.streetAddress,
      addressLocality: STORE.city,
      addressRegion: STORE.stateCode,
      ...(STORE.postalCode ? { postalCode: STORE.postalCode } : {}),
      addressCountry: STORE.country,
    };
  }
  if (hasVerifiedPhone()) data.telephone = STORE.phone;
  if (STORE.hoursVerified && STORE.hours) data.openingHours = STORE.hours;
  if (canonicalUrl) data.url = canonicalUrl;
  return data;
}

/** Absolute canonical URL for the preview deployment. */
export function canonicalUrl() {
  return `${SITE.origin}${SITE.base}`;
}

/** robots meta content derived from the indexing policy. */
export function robotsMeta() {
  return SITE.indexingEnabled ? 'index,follow' : 'noindex,nofollow';
}

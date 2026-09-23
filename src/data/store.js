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
    'Vape N More Kirbyville business-information preview, for adults 21+.',
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

  // Listing and contact details transcribed by the user, 2026-09-23.
  // Verification here means supplied/confirmed by the project owner, not a live API feed.
  listingUrl: 'https://share.google/CHdy1QkwX52be3h7a',
  factsSource: 'User-provided Google listing transcription, 2026-09-23',

  streetAddress: '21034 US-96',
  streetAddressVerified: true,
  postalCode: '75956',
  postalCodeVerified: true,
  phone: '(409) 279-1126',
  phoneVerified: true,
  hours: 'Mo-Su 09:00-21:00',
  hoursLabel: 'Daily, 9 AM–9 PM',
  hoursVerified: true,
  // ---- Unverified fields remain null ----
  reviewUrl: null,
  reviewUrlVerified: false,
  social: {
    facebook: null,
    instagram: null,
    verified: false,
  },

  // ---- Derived / policy-safe values ----
  /**
   * Search the supplied address without inventing geographic coordinates.
   * directionsHref falls back to name/city if address verification is revoked.
   */
  directionsKind: 'maps-address-search',
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

/** Directions target: supplied address when verified, otherwise name/city search. */
export function directionsHref() {
  if (hasVerifiedAddress()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${STORE.name}, ${STORE.streetAddress}, ${STORE.city}, ${STORE.stateCode} ${STORE.postalCode || ''}`.trim(),
    )}`;
  }
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
  return STORE.hoursVerified && STORE.hours ? STORE.hoursLabel || STORE.hours : 'Call for current hours';
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

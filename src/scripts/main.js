/* ==========================================================================
   main.js — orchestrator: styles, store hydration, module boot
   ========================================================================== */

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/sections.css';
import '../styles/responsive.css';
import { initGallery } from './gallery.js';

import {
  STORE,
  contactHref,
  directionsHref,
  hasVerifiedPhone,
  hasVerifiedAddress,
  phoneDisplay,
  addressDisplay,
  hoursDisplay,
} from '../data/store.js';

import {
  initReveals,
  initHeaderState,
  initMobileMenu,
  initActiveNav,
  initParallax,
  initVapor,
} from './motion.js';

/**
 * Hydrates every business-data slot from src/data/store.js.
 * The static HTML already renders the unverified-safe state, so this only
 * *upgrades* the page when verified data exists. One place to change, one
 * place to trust.
 */
function hydrateStore() {
  document.querySelectorAll('[data-contact-href]').forEach((el) => {
    el.setAttribute('href', contactHref());
  });

  document.querySelectorAll('[data-directions-href]').forEach((el) => {
    el.setAttribute('href', directionsHref());
  });

  const phoneKnown = hasVerifiedPhone();

  document.querySelectorAll('[data-phone-value]').forEach((el) => {
    if (phoneKnown) el.textContent = STORE.phone;
  });
  document.querySelectorAll('[data-store-phone]').forEach((el) => {
    el.textContent = phoneDisplay();
  });

  const phoneLink = document.querySelector('a.phone-slot');
  const phonePending = document.querySelector('[data-phone-pending]');
  if (phoneLink) phoneLink.hidden = !phoneKnown;
  if (phonePending) phonePending.hidden = phoneKnown;

  const addressKnown = hasVerifiedAddress();
  const addressPending = document.querySelector('[data-store-address-pending]');
  const addressValue = document.querySelector('[data-store-address-value]');
  if (addressPending) addressPending.hidden = addressKnown;
  if (addressValue) addressValue.textContent = addressDisplay();

  document.querySelectorAll('[data-store-hours]').forEach((el) => {
    el.textContent = hoursDisplay();
  });

  const reviewStatus = document.querySelector('[data-review-status]');
  if (reviewStatus && STORE.reviewUrlVerified && STORE.reviewUrl) {
    reviewStatus.innerHTML = '<span class="status__dot" aria-hidden="true"></span>Connected';
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}

function boot() {
  hydrateStore();

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('#site-nav');
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));

  const jobs = [
    () => initReveals(),
    () => initHeaderState(header),
    () => initMobileMenu({ header, toggle, nav }),
    () => initActiveNav(navLinks),
    () => initParallax(document.querySelector('[data-parallax]')),
    () => initVapor(document.querySelector('[data-vapor-canvas]')),
    () => initGallery(document.querySelector('[data-gallery]')),
  ];

  for (const job of jobs) {
    try {
      job();
    } catch (error) {
      // Never let one enhancement break the rest of the page.
      console.warn('[vnm] enhancement failed:', error);
    }
  }

  // Failsafe: if anything is still hidden and in view after 4s, show it.
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  }, 4000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

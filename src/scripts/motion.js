/* ==========================================================================
   motion.js — restrained motion + atmospheric vapor
   Everything here is progressive enhancement: the site is complete without it.
   ========================================================================== */

const reduceMotionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------ reveals --------------------------------- */
export function initReveals() {
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!els.length) return;

  if (reduceMotionQuery().matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  els.forEach((el) => io.observe(el));
}

/* --------------------------- header scroll state ------------------------ */
export function initHeaderState(header) {
  if (!header) return;
  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
}

/* ------------------------------ mobile menu ----------------------------- */
export function initMobileMenu({ header, toggle, nav }) {
  if (!header || !toggle || !nav) return;
  const mq = window.matchMedia('(max-width: 979px)');
  let open = false;

  const setOpen = (next, { returnFocus = false } = {}) => {
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('is-menu-open', open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!open));

  nav.addEventListener('click', (event) => {
    if (mq.matches && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setOpen(false, { returnFocus: true });
  });

  document.addEventListener('pointerdown', (event) => {
    if (open && !header.contains(event.target)) setOpen(false);
  });

  mq.addEventListener('change', (event) => {
    if (!event.matches && open) setOpen(false);
  });
}

/* ------------------------------- active nav ----------------------------- */
export function initActiveNav(links) {
  if (!links.length) return;
  const pairs = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((pair) => pair.section);
  if (!pairs.length) return;

  let ticking = false;

  const update = () => {
    const probe = window.scrollY + 140;
    let current = pairs[0];
    for (const pair of pairs) {
      if (pair.section.getBoundingClientRect().top + window.scrollY <= probe) current = pair;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = pairs[pairs.length - 1];
    }
    for (const pair of pairs) {
      const active = pair === current;
      pair.link.classList.toggle('is-active', active);
      if (active) pair.link.setAttribute('aria-current', 'true');
      else pair.link.removeAttribute('aria-current');
    }
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
}

/* --------------------------- pointer parallax --------------------------- */
export function initParallax(el) {
  if (!el) return;
  if (reduceMotionQuery().matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.innerWidth < 1024) return;

  const hero = el.closest('.hero');
  if (!hero) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = null;

  const tick = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
    const settled =
      Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
    if (settled) {
      raf = null;
    } else {
      raf = window.requestAnimationFrame(tick);
    }
  };

  const kick = () => {
    if (!raf) raf = window.requestAnimationFrame(tick);
  };

  hero.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = nx * 14;
      targetY = ny * 10;
      kick();
    },
    { passive: true },
  );

  hero.addEventListener(
    'pointerleave',
    () => {
      targetX = 0;
      targetY = 0;
      kick();
    },
    { passive: true },
  );
}

/* ---------------------------- atmospheric vapor ------------------------- */
/**
 * Rising, low-opacity vapor. Canvas 2D only — pre-rendered sprites, capped
 * frame rate, DPR cap, fewer particles on mobile, and fully disabled for
 * prefers-reduced-motion. Pauses when the tab is hidden or the hero is
 * off-screen.
 */
export function initVapor(canvas) {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const COUNT = isMobile ? 12 : 26;
  const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
  const FRAME_MS = 1000 / 30;

  const makeSprite = (rgb) => {
    const size = 256;
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `${rgb}0.28)`);
    grad.addColorStop(0.45, `${rgb}0.09)`);
    grad.addColorStop(1, `${rgb}0)`);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, size, size);
    // Bake soft filaments once; animation frames only composite these sprites.
    sctx.lineCap = 'round';
    for (let i = 0; i < 12; i += 1) {
      sctx.beginPath();
      sctx.moveTo(102 + i * 3, 254);
      sctx.bezierCurveTo(18 + i * 6, 172, 226 - i * 5, 130, 104 + i * 3, 12);
      sctx.strokeStyle = `${rgb}${0.12 + (i % 3) * 0.04})`;
      sctx.lineWidth = 2 + i * 0.7;
      sctx.filter = `blur(${2 + (i % 3)}px)`;
      sctx.stroke();
    }
    sctx.filter = 'none';
    sctx.globalCompositeOperation = 'destination-in';
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, size, size);
    return sprite;
  };

  const sprites = [
    makeSprite('rgba(160,208,212,'),
    makeSprite('rgba(184,211,229,'),
    makeSprite('rgba(215,193,164,'),
  ];

  let width = 1;
  let height = 1;
  const particles = [];

  const spawn = (initial, index = 0) => {
    const roll = Math.random();
    const spriteIndex = roll < 0.62 ? 0 : roll < 0.9 ? 1 : 2;
    return {
      spriteIndex,
      // Most wisps stay along the left edge; a few bridge the lower scene.
      origin: index % 5 === 4 ? 0.43 + Math.random() * 0.1 : Math.random() * 0.12,
      y: initial ? Math.random() * height : height * 1.16,
      r: (isMobile ? 50 : 65) + Math.random() * (isMobile ? 45 : 80),
      alpha: 0.3 + Math.random() * 0.2,
      vy: -(7 + Math.random() * 7),
      drift: 12 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      spin: 0.00018 + Math.random() * 0.00035,
    };
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  resize();
  for (let i = 0; i < COUNT; i += 1) particles.push(spawn(true, i));

  let running = true;
  let inView = true;
  let paused = false;
  const motionPreference = reduceMotionQuery();
  const motionToggle = document.querySelector('[data-motion-toggle]');
  let rafId = null;
  let last = 0;
  let elapsed = 0;

  const paint = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const x = p.origin * width + Math.sin(elapsed * p.spin + p.phase) * p.drift;
      const topFade = Math.min(1, Math.max(0, (p.y + p.r) / (height * 0.3)));
      const bottomFade = Math.min(1, Math.max(0, (height * 1.16 - p.y) / p.r));
      ctx.globalAlpha = p.alpha * topFade * bottomFade;
      ctx.drawImage(sprites[p.spriteIndex], x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const step = (time) => {
    rafId = window.requestAnimationFrame(step);
    if (!last) last = time;
    const delta = time - last;
    if (delta < FRAME_MS) return;
    last = time;
    // A stalled frame must not teleport the plume. Velocity is pixels/second.
    const dt = Math.min(delta, 100);
    elapsed += dt;
    particles.forEach((p, index) => {
      p.y += p.vy * dt / 1000;
      if (p.y + p.r < -20) Object.assign(p, spawn(false, index));
    });
    paint();
  };

  const start = () => {
    if (running && !paused && !motionPreference.matches && !document.hidden && rafId === null) {
      last = 0;
      rafId = window.requestAnimationFrame(step);
    }
  };

  const stop = () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const setRunning = (next) => {
    running = next;
    if (next) start();
    else stop();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (running) start();
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
          setRunning(inView);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);
  }

  window.addEventListener(
    'resize',
    () => {
      const previousHeight = height;
      resize();
      for (const p of particles) p.y *= height / previousHeight;
      // Keep a paused frame visible after a viewport change.
      if (!motionPreference.matches) paint();
    },
    { passive: true },
  );

  const updateToggle = () => {
    if (!motionToggle) return;
    motionToggle.hidden = motionPreference.matches;
    motionToggle.textContent = paused ? 'Resume atmosphere' : 'Pause atmosphere';
    motionToggle.setAttribute('aria-pressed', String(paused));
  };
  motionToggle?.addEventListener('click', () => {
    paused = !paused;
    if (paused) stop();
    else setRunning(inView);
    updateToggle();
  });
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      stop();
      ctx.clearRect(0, 0, width, height);
    } else {
      setRunning(inView);
    }
    updateToggle();
  });

  updateToggle();
  start();
}

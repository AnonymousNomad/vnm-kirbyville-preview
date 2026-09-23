/** One shuffle at initialization, then predictable circular navigation. */
export function shuffleOnce(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function initGallery(root) {
  if (!root) return;
  const stage = root.querySelector('[data-gallery-stage]');
  const slides = shuffleOnce([...stage.querySelectorAll('[data-media-id]')]);
  if (slides.length < 2) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const play = root.querySelector('[data-gallery-play]');
  const counter = root.querySelector('[data-gallery-counter]');
  const pagination = root.querySelector('[data-gallery-pagination]');
  const announcement = root.querySelector('[data-gallery-announcement]');
  const dialog = document.querySelector('[data-lightbox]');
  const dialogImage = dialog.querySelector('[data-lightbox-image]');
  let index = 0;
  let paused = preference.matches;
  let hovered = false;
  let inView = false;
  let timer;
  let pointer;
  let lastSwipe = 0;
  let opener;
  let pointerRotationNext = null;

  slides.forEach(slide => stage.append(slide));
  const dots = slides.map((slide, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show photograph ${i + 1}: ${slide.querySelector('figcaption span').textContent}`);
    button.addEventListener('click', () => go(i, true));
    pagination.append(button);
    return button;
  });

  function schedule() {
    clearTimeout(timer);
    const running = !paused && !preference.matches && !hovered && inView && !document.hidden && !dialog.open;
    root.dataset.rotation = running ? 'running' : 'paused';
    play.disabled = preference.matches;
    play.textContent = preference.matches ? 'Auto rotation off' : paused ? 'Play rotation' : 'Pause rotation';
    play.setAttribute('aria-label', preference.matches ? 'Auto rotation disabled by reduced motion preference' : paused ? 'Start gallery rotation' : 'Pause gallery rotation');
    if (running) timer = window.setTimeout(() => go(index + 1), 6000);
  }

  function paint() {
    slides.forEach((slide, i) => {
      let slot = (i - index + slides.length) % slides.length;
      if (slot > slides.length / 2) slot -= slides.length;
      slide.style.setProperty('--slot', slot);
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      dots[i].setAttribute('aria-current', String(active));
    });
    root.dataset.activeId = slides[index].dataset.mediaId;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    schedule();
  }

  function go(next, manual = false) {
    index = (next + slides.length) % slides.length;
    if (manual) paused = true;
    paint();
    if (manual) announcement.textContent = `${index + 1} of ${slides.length}. ${slides[index].querySelector('figcaption span').textContent}`;
  }

  function stop() { paused = true; schedule(); }
  root.querySelector('[data-gallery-prev]').addEventListener('click', () => go(index - 1, true));
  root.querySelector('[data-gallery-next]').addEventListener('click', () => go(index + 1, true));
  // Pointer focus enters before click. Preserve the intended pause action even
  // though focus entry itself pauses rotation (keyboard entry still pauses).
  play.addEventListener('pointerdown', () => { pointerRotationNext = !paused; });
  play.addEventListener('click', event => {
    paused = event.detail > 0 && pointerRotationNext !== null ? pointerRotationNext : !paused;
    pointerRotationNext = null;
    schedule();
  });
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  // Focus entry stops until the user explicitly restarts, as required by WAI.
  root.addEventListener('focusin', stop);
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index + (event.key === 'ArrowRight' ? 1 : -1), true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); go(event.key === 'Home' ? 0 : slides.length - 1, true);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    stop(); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      stage.setPointerCapture(event.pointerId);
      if (event.cancelable) event.preventDefault();
    }
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      go(index + (dx < 0 ? 1 : -1), true);
      lastSwipe = performance.now();
    }
    pointer = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  });
  stage.addEventListener('pointercancel', () => { pointer = null; });
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('click', event => {
    const button = event.target.closest('[data-gallery-open]');
    if (!button) return;
    event.preventDefault();
    if (performance.now() - lastSwipe < 350) return;
    stop();
    opener = button;
    const photo = button.querySelector('img');
    dialogImage.src = photo.currentSrc || photo.src;
    dialogImage.alt = photo.alt;
    dialog.querySelector('[data-lightbox-caption]').textContent = button.closest('figure').querySelector('figcaption span').textContent;
    dialog.showModal();
  });
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { dialogImage.removeAttribute('src'); opener?.focus(); schedule(); });
  preference.addEventListener('change', () => { if (preference.matches) paused = true; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.2 }).observe(stage);
  root.querySelectorAll('[data-gallery-controls]').forEach(el => { el.hidden = false; });
  root.classList.add('is-ready');
  paint();
}

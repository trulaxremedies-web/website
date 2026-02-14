(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Vibe (theme) switcher
  const root = document.documentElement;
  const vibeButtons = Array.from(document.querySelectorAll('[data-vibe-btn]'));
  const VIBE_KEY = 'trulax.vibe';

  function setVibe(vibe) {
    if (!vibe) return;
    root.setAttribute('data-vibe', vibe);
    try {
      localStorage.setItem(VIBE_KEY, vibe);
    } catch (_) {
      // ignore
    }

    vibeButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-vibe') === vibe;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.classList.toggle('is-active', isActive);
    });
  }

  // init vibe from localStorage
  (function initVibe() {
    let saved = null;
    try {
      saved = localStorage.getItem(VIBE_KEY);
    } catch (_) {
      saved = null;
    }
    setVibe(saved || root.getAttribute('data-vibe') || 'premium');
  })();

  vibeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setVibe(btn.getAttribute('data-vibe'));
    });
  });

  // Reveal on scroll
  const items = Array.from(document.querySelectorAll('[data-reveal]'));
  if (items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
  }

  // Accordion: allow only one open at a time
  const acc = document.querySelector('[data-accordion]');
  if (acc) {
    acc.addEventListener('toggle', (evt) => {
      const target = evt.target;
      if (!(target instanceof HTMLDetailsElement)) return;
      if (!target.open) return;
      acc.querySelectorAll('details').forEach((d) => {
        if (d !== target) d.removeAttribute('open');
      });
    });
  }

  // Product gallery modal
  const galleryDialog = document.querySelector('[data-gallery]');
  const galleryClose = document.querySelector('[data-gallery-close]');
  const galleryPrev = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  const galleryTitle = document.querySelector('[data-gallery-title]');
  const galleryImg = document.querySelector('[data-gallery-img]');
  const galleryThumbs = document.querySelector('[data-gallery-thumbs]');
  const triggers = Array.from(document.querySelectorAll('[data-gallery-trigger]'));

  let lastFocused = null;
  let currentImages = [];
  let currentTitle = 'Gallery';
  let currentIndex = 0;

  function parseImages(value) {
    return String(value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function updateNavState() {
    if (galleryPrev) galleryPrev.disabled = currentImages.length <= 1;
    if (galleryNext) galleryNext.disabled = currentImages.length <= 1;
  }

  function setActiveImageByIndex(index) {
    if (!currentImages.length) return;
    const bounded = ((index % currentImages.length) + currentImages.length) % currentImages.length;
    currentIndex = bounded;
    const src = currentImages[currentIndex];
    if (!galleryImg) return;

    galleryImg.src = src;
    galleryImg.alt = `${currentTitle} image ${currentIndex + 1}`;

    if (galleryThumbs) {
      const buttons = Array.from(galleryThumbs.querySelectorAll('button[data-src]'));
      buttons.forEach((b) => {
        const isActive = b.getAttribute('data-src') === src;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    updateNavState();
  }

  function openGallery({ title, images }) {
    if (!(galleryDialog instanceof HTMLDialogElement)) return;

    currentTitle = title || 'Gallery';
    currentImages = images || [];
    currentIndex = 0;

    if (galleryTitle) galleryTitle.textContent = currentTitle;

    if (galleryThumbs) {
      galleryThumbs.innerHTML = '';
      currentImages.forEach((src, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'modal__thumb';
        btn.setAttribute('data-src', src);
        btn.setAttribute('aria-label', `View image ${idx + 1}`);
        btn.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
        btn.addEventListener('click', () => setActiveImageByIndex(idx));
        galleryThumbs.appendChild(btn);
      });
    }

    setActiveImageByIndex(0);

    lastFocused = document.activeElement;
    galleryDialog.showModal();
  }

  function closeGallery() {
    if (!(galleryDialog instanceof HTMLDialogElement)) return;
    if (galleryDialog.open) galleryDialog.close();
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function onTriggerActivate(el) {
    const title = el.getAttribute('data-gallery-title') || 'Gallery';
    const images = parseImages(el.getAttribute('data-gallery-images'));
    if (!images.length) return;
    openGallery({ title, images });
  }

  triggers.forEach((el) => {
    el.addEventListener('click', () => onTriggerActivate(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTriggerActivate(el);
      }
    });
  });

  if (galleryClose) galleryClose.addEventListener('click', closeGallery);
  if (galleryPrev) galleryPrev.addEventListener('click', () => setActiveImageByIndex(currentIndex - 1));
  if (galleryNext) galleryNext.addEventListener('click', () => setActiveImageByIndex(currentIndex + 1));

  if (galleryDialog instanceof HTMLDialogElement) {
    // Close on ESC handled by dialog by default; this ensures focus restore.
    galleryDialog.addEventListener('close', () => {
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    });

    // Keyboard navigation when modal is open
    galleryDialog.addEventListener('keydown', (e) => {
      if (!galleryDialog.open) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveImageByIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveImageByIndex(currentIndex + 1);
      }
    });

    // Click on backdrop closes
    galleryDialog.addEventListener('click', (e) => {
      const rect = galleryDialog.getBoundingClientRect();
      const inDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!inDialog) closeGallery();
    });

    // Ensure ESC restores focus
    galleryDialog.addEventListener('cancel', () => {
      closeGallery();
    });
  }
})();

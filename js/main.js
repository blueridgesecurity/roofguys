/* Roof Guys site interactions
   Uses anime.js v4 (loaded via CDN in HTML).
   Falls back gracefully if anime is unavailable. */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- NAV ----------
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') navLinks.classList.remove('is-open');
    });
  }

  // ---------- REVEAL ON SCROLL ----------
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- HERO TITLE WORD STAGGER (anime.js) ----------
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !reduceMotion) {
    // Wrap each word in a span for staggered animation
    const html = heroTitle.innerHTML;
    // Only wrap text nodes — keep existing <span class="accent"> intact
    const wordWrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (/^\s+$/.test(p) || p === '') {
            frag.appendChild(document.createTextNode(p));
          } else {
            const s = document.createElement('span');
            s.className = 'word';
            s.textContent = p;
            frag.appendChild(s);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wordWrap);
      }
    };
    Array.from(heroTitle.childNodes).forEach(wordWrap);

    const words = heroTitle.querySelectorAll('.word');
    if (window.anime && words.length) {
      const a = window.anime;
      // anime v4 API: animate(targets, params)
      const run = a.animate || a; // v4 has animate; v3 uses anime() directly
      const params = {
        translateY: [60, 0],
        opacity: [0, 1],
        rotate: [4, 0],
        duration: 900,
        easing: 'easeOutExpo',
        delay: a.stagger ? a.stagger(80) : (el, i) => i * 80,
      };
      if (a.animate) {
        a.animate(words, params);
      } else {
        a({ targets: words, ...params });
      }
    } else {
      words.forEach((w, i) => {
        w.style.transition = `opacity .8s ease ${i * 0.08}s, transform .8s ease ${i * 0.08}s`;
        w.style.opacity = '0';
        w.style.transform = 'translateY(30px)';
        requestAnimationFrame(() => {
          w.style.opacity = '1';
          w.style.transform = 'none';
        });
      });
    }
  }

  // ---------- HERO TRUST PILLS POP-IN ----------
  const badges = document.querySelectorAll('.trust-row li');
  if (badges.length && window.anime && !reduceMotion) {
    const a = window.anime;
    const params = {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic',
      delay: a.stagger ? a.stagger(120, { start: 700 }) : (el, i) => 700 + i * 120,
    };
    if (a.animate) a.animate(badges, params);
    else a({ targets: badges, ...params });
  }

  // ---------- COUNT-UP STATS ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 1600;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = target * eased;
            el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          io2.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io2.observe(c));
  }

  // ---------- ACTIVE NAV LINK ----------
  const path = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === path) a.classList.add('is-active');
  });

  // ---------- CONTACT FORM (front-end only) ----------
  const form = document.querySelector('form[data-form="quote"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
      // No backend wired up — simulate, then mailto fallback
      const data = new FormData(form);
      const subject = encodeURIComponent('Roof Guys quote request — ' + (data.get('name') || ''));
      const body = encodeURIComponent(
        `Name: ${data.get('name') || ''}\nPhone: ${data.get('phone') || ''}\nEmail: ${data.get('email') || ''}\nService: ${data.get('service') || ''}\n\n${data.get('message') || ''}`
      );
      setTimeout(() => {
        window.location.href = `mailto:roofguyben@gmail.com?subject=${subject}&body=${body}`;
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
        form.reset();
      }, 400);
    });
  }

  // ---------- PARALLAX (subtle) ----------
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    const onScrollPx = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    };
    document.addEventListener('scroll', onScrollPx, { passive: true });
  }

  // ---------- REVIEWS CAROUSEL ----------
  const reviews = document.getElementById('reviews');
  if (reviews) {
    const track = reviews.querySelector('.reviews__track');
    const slides = Array.from(reviews.querySelectorAll('.review'));
    const prevBtn = reviews.querySelector('.reviews__nav--prev');
    const nextBtn = reviews.querySelector('.reviews__nav--next');
    const dotsWrap = reviews.querySelector('.reviews__dots');
    let idx = 0;
    let timer = null;

    // Build dots
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Show review ' + (i + 1));
      b.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      slides.forEach((s, k) => s.toggleAttribute('data-active', k === idx));
      dots.forEach((d, k) => d.setAttribute('aria-selected', k === idx ? 'true' : 'false'));
      if (user) restart();
    }

    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    prevBtn && prevBtn.addEventListener('click', () => { prev(); restart(); });
    nextBtn && nextBtn.addEventListener('click', () => { next(); restart(); });

    reviews.addEventListener('mouseenter', () => timer && clearInterval(timer));
    reviews.addEventListener('mouseleave', restart);

    // Touch swipe
    let startX = 0, dx = 0, dragging = false;
    reviews.addEventListener('touchstart', (e) => {
      dragging = true; startX = e.touches[0].clientX; dx = 0;
    }, { passive: true });
    reviews.addEventListener('touchmove', (e) => {
      if (!dragging) return; dx = e.touches[0].clientX - startX;
    }, { passive: true });
    reviews.addEventListener('touchend', () => {
      if (!dragging) return; dragging = false;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); restart(); }
    });

    go(0);
    if (!reduceMotion) restart();
  }

  // ---------- CURRENT YEAR ----------
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();

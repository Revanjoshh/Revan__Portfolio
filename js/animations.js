/*==========================================================
  ANIMATIONS.JS — Scroll-Reveal & Skill Bar System
  Portfolio of Revan Josh. J

  Uses IntersectionObserver (no external libraries needed).
  Must be loaded AFTER main.js (or at least after DOM ready).
==========================================================*/

/* --------------------------------------------------------
   Utility: throttle a callback to once per animation frame
   -------------------------------------------------------- */
function rafThrottle(fn) {
  let pending = false;
  return function (...args) {
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        pending = false;
      });
    }
  };
}


/* ========================================================
   1.  SCROLL-REVEAL — annotate elements, then observe
   ======================================================== */

/**
 * Annotates elements with scroll-reveal classes and staggered
 * CSS custom property delays, then sets up an IntersectionObserver
 * to add `.anim-visible` when they enter the viewport.
 */
function initScrollReveal() {

  /* Map: CSS selector → { type, baseDelay, stagger } */
  const revealMap = [
    /* Section titles */
    { sel: '.section__title',         type: 'anim-fade-up',    base: 0,   stagger: 0 },

    /* About section */
    { sel: '.about__img-wrapper',     type: 'anim-fade-right',  base: 0,   stagger: 0 },
    { sel: '.about__subtitle-tag',    type: 'anim-fade-left',   base: 0.05,stagger: 0 },
    { sel: '.about__heading',         type: 'anim-fade-left',   base: 0.12,stagger: 0 },
    { sel: '.about__description',     type: 'anim-fade-left',   base: 0.2, stagger: 0 },
    { sel: '.about__box',             type: 'anim-scale',       base: 0.1, stagger: 0.08 },
    { sel: '.about__data .button',    type: 'anim-fade-up',     base: 0.35,stagger: 0 },

    /* Qualification / Timeline */
    { sel: '.qualification__title',   type: 'anim-fade-up',     base: 0,   stagger: 0.1 },
    { sel: '.timeline__item',         type: 'anim-fade-left',   base: 0.05,stagger: 0.12 },

    /* Skills */
    { sel: '.skills__header',         type: 'anim-fade-up',     base: 0,   stagger: 0.1 },
    { sel: '.skills__data',           type: 'anim-fade-up',     base: 0,   stagger: 0.08 },

    /* Work cards */
    { sel: '.work__card',             type: 'anim-scale',       base: 0,   stagger: 0.07 },
    { sel: '.category-title',         type: 'anim-fade-up',     base: 0,   stagger: 0 },

    /* Services */
    { sel: '.services__content',      type: 'anim-scale',       base: 0,   stagger: 0.1 },

    /* Testimonials */
    { sel: '.testimonial__card',      type: 'anim-fade-up',     base: 0,   stagger: 0.12 },

    /* Contact */
    { sel: '.contact__card',          type: 'anim-fade-up',     base: 0,   stagger: 0.1 },
    { sel: '.contact__form',          type: 'anim-fade-right',  base: 0.1, stagger: 0 },

    /* Footer */
    { sel: '.footer__title',          type: 'anim-fade-up',     base: 0,   stagger: 0 },
    { sel: '.footer__links',          type: 'anim-fade-up',     base: 0.1, stagger: 0 },
    { sel: '.footer__socials',        type: 'anim-fade-up',     base: 0.2, stagger: 0 },
  ];

  revealMap.forEach(({ sel, type, base, stagger }) => {
    const els = document.querySelectorAll(sel);
    els.forEach((el, i) => {
      /* Skip if already animated (e.g. hero elements) */
      if (el.classList.contains('anim-fade-up') ||
          el.classList.contains('anim-fade-left') ||
          el.classList.contains('anim-fade-right') ||
          el.classList.contains('anim-scale') ||
          el.classList.contains('anim-fade')) return;

      el.classList.add(type);
      const delay = base + i * stagger;
      el.style.setProperty('--anim-delay', delay.toFixed(2) + 's');
    });
  });

  /* IntersectionObserver — fires when ≥15% of element is in view */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target); /* fire once only */
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll(
    '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale, .anim-fade'
  ).forEach((el) => observer.observe(el));
}


/* ========================================================
   2.  SKILL BARS — animate width from 0 on first view
   ======================================================== */

function initSkillBars() {
  const bars = document.querySelectorAll('.skills__percentage');

  bars.forEach((bar) => {
    /* Store the target width before hiding it */
    const targetWidth = bar.style.width || '0%';
    bar.dataset.targetWidth = targetWidth;
    bar.classList.add('skill-hidden');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          /* Small delay so the section title animates first */
          setTimeout(() => {
            bar.classList.remove('skill-hidden');
            bar.classList.add('skill-animate');
            bar.style.width = bar.dataset.targetWidth;
          }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((bar) => observer.observe(bar));
}


/* ========================================================
   3.  DYNAMICALLY-INJECTED CARDS — re-observe after load
   ======================================================== */

/**
 * Called after Supabase loads project cards into the DOM.
 * Wires up scroll-reveal for newly created .work__card elements.
 */
function observeNewCards() {
  const cards = document.querySelectorAll(
    '.work__card:not(.anim-scale):not(.anim-fade-up)'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  cards.forEach((card, i) => {
    if (!card.classList.contains('anim-scale')) {
      card.classList.add('anim-scale');
      card.style.setProperty('--anim-delay', (i * 0.07).toFixed(2) + 's');
    }
    observer.observe(card);
  });
}


/* ========================================================
   4.  ACTIVE-SECTION INDICATOR — smooth nav highlight
   (Supplements the existing navHighlighter in main.js)
   ======================================================== */

/* Already handled by main.js — no duplicate needed */


/* ========================================================
   5.  HERO PHOTO — subtle parallax depth on mouse move
   ======================================================== */

function initHeroParallax() {
  const heroSection = document.querySelector('.home');
  const heroImg     = document.querySelector('.home__img');

  if (!heroSection || !heroImg) return;

  /* Only on desktop — skip touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  const handleMove = rafThrottle((e) => {
    const rect   = heroSection.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / rect.width;   /* -0.5 → 0.5 */
    const dy     = (e.clientY - cy) / rect.height;

    /* Subtle shift: max ±8px horizontal, ±5px vertical */
    const tx = (-dx * 8).toFixed(2);
    const ty = (-dy * 5).toFixed(2);

    /* Preserve the heroFloat animation by using CSS var override */
    heroImg.style.setProperty('--parallax-x', tx + 'px');
    heroImg.style.setProperty('--parallax-y', ty + 'px');
  });

  heroSection.addEventListener('mousemove', handleMove);

  heroSection.addEventListener('mouseleave', () => {
    heroImg.style.setProperty('--parallax-x', '0px');
    heroImg.style.setProperty('--parallax-y', '0px');
  });
}


/* ========================================================
   6.  MUTUAL HOOK — patch loadCustomProjects to re-observe
   ======================================================== */

/**
 * After Supabase injects cards, call observeNewCards().
 * We use a MutationObserver on the project containers so
 * we don't need to modify main.js.
 */
function watchProjectContainers() {
  const containers = document.querySelectorAll(
    '#web-projects-container, #design-projects-container, .work__container'
  );

  if (!containers.length) return;

  const mo = new MutationObserver(() => {
    /* Debounce — wait for batch insertions to settle */
    clearTimeout(mo._timer);
    mo._timer = setTimeout(observeNewCards, 300);
  });

  containers.forEach((c) =>
    mo.observe(c, { childList: true, subtree: false })
  );
}


/* ========================================================
   7.  INIT — run everything when DOM is ready
   ======================================================== */

function initAnimations() {
  initScrollReveal();
  initSkillBars();
  initHeroParallax();
  watchProjectContainers();
}

/* If DOM already ready, run now; otherwise wait */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

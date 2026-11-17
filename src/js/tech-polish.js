/* ==========================================================================
   MITRA Interior & Constructions — Performance & Technical Polish Modules
   - 4.1 Shimmer Skeleton Screens & Progressive Blur-Up Images
   - 4.2 Scroll-To-Top Circular Progress Ring (SVG Stroke Animation)
   - 4.3 Luxury Dark / Light Architectural Mode (Evening Studio)
   ========================================================================== */

/**
 * Initializes Luxury Dark / Light Architectural Mode Switcher
 */
export function initThemeSwitcher() {
  const toggleBtns = [
    document.getElementById('themeToggleBtn'),
    document.getElementById('mobileThemeToggleBtn')
  ].filter(Boolean);

  if (!toggleBtns.length) return;

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('mitra-theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('mitra-theme', 'light'); } catch (e) {}
    }

    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' 
        ? 'Switch to Day Plaster Mode' 
        : 'Switch to Evening Studio Mode');
    });
  }

  // Bind click listeners
  toggleBtns.forEach(btn => {
    if (btn.dataset.themeBound) return;
    btn.dataset.themeBound = 'true';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getCurrentTheme();
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  });

  // Listen to OS theme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('mitra-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

/**
 * Initializes Scroll-To-Top Circular Progress Ring
 */
export function initScrollProgressRing() {
  const btn = document.getElementById('scrollToTopBtn');
  const circle = document.getElementById('scrollProgressCircle');
  if (!btn || !circle || btn.dataset.scrollBound) return;
  btn.dataset.scrollBound = 'true';

  const circumference = 2 * Math.PI * 20; // r = 20 -> ~125.66
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollTop > 280) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }

        if (docHeight > 0) {
          const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
          const offset = circumference - (progress * circumference);
          circle.style.strokeDashoffset = `${offset.toFixed(2)}`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/**
 * Progressive Blur-Up Image Loading with Shimmer Skeletons
 */
export function initImageShimmerAndBlurUp() {
  const images = document.querySelectorAll('img:not(.no-shimmer)');
  if (!images.length) return;

  images.forEach(img => {
    if (img.dataset.blurUpBound) return;
    img.dataset.blurUpBound = 'true';

    // Wrap in skeleton container if parent isn't already styled
    const parent = img.parentElement;
    if (parent && !parent.classList.contains('img-skeleton-wrap') && !img.classList.contains('logo-img')) {
      parent.classList.add('img-skeleton-wrap');
    }

    img.classList.add('blur-up');

    function markLoaded() {
      img.classList.add('loaded');
      if (parent && parent.classList.contains('img-skeleton-wrap')) {
        parent.classList.add('skeleton-done');
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true });
    }
  });
}

/**
 * Master initializer for Section 4: Performance & Technical Polish
 */
export function initTechPolish() {
  initThemeSwitcher();
  initScrollProgressRing();
  initImageShimmerAndBlurUp();
}

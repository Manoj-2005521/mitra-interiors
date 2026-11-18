/* ==========================================================================
   MITRA Interior & Constructions — Performance & Technical Polish Modules
   - 4.1 Shimmer Skeleton Screens & Progressive Blur-Up Images
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
  initImageShimmerAndBlurUp();
}

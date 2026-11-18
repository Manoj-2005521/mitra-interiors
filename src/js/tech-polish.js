/* ==========================================================================
   MITRA Interior & Constructions — Performance & Technical Polish Modules
   - 4.1 Shimmer Skeleton Screens & Progressive Blur-Up Images
   ========================================================================== */

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
  initImageShimmerAndBlurUp();
}

/* ==========================================================================
   MITRA Interior & Constructions — Bento Grid Interactive Micro-Modules
   - Cursor-Tracking Glare Highlight (Linear / Apple aesthetic)
   - 3D Dynamic Perspective Hover Tilt
   - Viewport-Triggered Live Number Counter
   ========================================================================== */

/**
 * Initializes cursor-tracking glare and 3D hover tilt on Bento tiles
 */
export function initBentoTiltAndGlare() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const tiles = document.querySelectorAll('[data-bento-tilt]');
  if (!tiles.length) return;

  tiles.forEach(tile => {
    if (tile.dataset.bentoBound) return;
    tile.dataset.bentoBound = 'true';

    let ticking = false;

    tile.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = tile.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Set CSS custom properties for cursor-tracking glare
          tile.style.setProperty('--mouse-x', `${x}px`);
          tile.style.setProperty('--mouse-y', `${y}px`);

          // 3D perspective tilt calculations (max 5 degrees)
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((centerY - y) / centerY) * 5;
          const rotateY = ((x - centerX) / centerX) * 5;

          tile.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    tile.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => {
        tile.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  });
}

/**
 * Live animated number counter for Bento hero tile
 */
export function initBentoCounters() {
  const counters = document.querySelectorAll('[data-bento-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetEl = entry.target;
        const targetValue = parseInt(targetEl.getAttribute('data-bento-count'), 10) || 100;
        const duration = 1400; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo
          const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentCount = Math.round(easeOut * targetValue);
          targetEl.textContent = currentCount;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            targetEl.textContent = targetValue;
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(targetEl);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Master initializer for Bento Grid
 */
export function initBentoGrid() {
  initBentoTiltAndGlare();
  initBentoCounters();
}

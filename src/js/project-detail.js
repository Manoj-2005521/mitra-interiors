/* ==========================================================================
   MITRA Interior & Constructions — Project Case Study Interactive Modules
   - Interactive Before/After Comparison Sliders (Touch, Drag & Keyboard)
   - Magazine-Grade Lightbox Gallery (Swipe, Zoom, Captions & Keyboard Nav)
   - Project Share & Clipboard Integration
   - Smooth Hero Anchor Scroll
   ========================================================================== */

/**
 * Initializes all Before/After comparison sliders on the page with spring physics,
 * 3-5px optical blur transition stripe, and dynamic edge-aware label fading
 */
export function initComparisonSliders() {
  const containers = document.querySelectorAll('.comparison-container');
  if (containers.length === 0) return;

  containers.forEach(container => {
    if (container.dataset.comparisonBound) return;
    container.dataset.comparisonBound = 'true';

    const beforeImage = container.querySelector('.image-before');
    const sliderLine = container.querySelector('.slider-line');
    const sliderKnob = container.querySelector('.slider-knob');
    const sliderBlurZone = container.querySelector('.slider-blur-zone');
    const labelBefore = container.querySelector('.case-badge-before, .label-before');
    const labelAfter = container.querySelector('.case-badge-after, .label-after');

    let isDragging = false;
    let currentPosition = 50; // Percentage
    let animationFrameId = null;
    let targetPosition = 50;
    let springAnimId = null;
    let springVelocity = 0;

    function updateLabels(clamped) {
      if (labelBefore) {
        if (clamped >= 68) {
          const factor = (clamped - 68) / 32;
          labelBefore.style.opacity = (0.7 + 0.3 * factor).toFixed(2);
          labelBefore.style.transform = `scale(${(1 + 0.06 * factor).toFixed(3)}) translateY(0)`;
        } else if (clamped <= 25) {
          labelBefore.style.opacity = Math.max(0.15, (clamped / 25) * 0.45).toFixed(2);
          labelBefore.style.transform = 'scale(0.96) translateY(0)';
        } else {
          labelBefore.style.opacity = '0.65';
          labelBefore.style.transform = 'scale(1) translateY(0)';
        }
      }

      if (labelAfter) {
        if (clamped <= 32) {
          const factor = (32 - clamped) / 32;
          labelAfter.style.opacity = (0.7 + 0.3 * factor).toFixed(2);
          labelAfter.style.transform = `scale(${(1 + 0.06 * factor).toFixed(3)}) translateY(0)`;
        } else if (clamped >= 75) {
          labelAfter.style.opacity = Math.max(0.15, ((100 - clamped) / 25) * 0.45).toFixed(2);
          labelAfter.style.transform = 'scale(0.96) translateY(0)';
        } else {
          labelAfter.style.opacity = '0.65';
          labelAfter.style.transform = 'scale(1) translateY(0)';
        }
      }
    }

    function updateSlider(position) {
      if (typeof position === 'number') {
        targetPosition = position;
      }
      const clamped = Math.max(0, Math.min(100, targetPosition));
      currentPosition = clamped;

      if (beforeImage) {
        beforeImage.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      }

      if (sliderBlurZone) {
        sliderBlurZone.style.left = `${clamped}%`;
      }
      if (sliderLine) {
        sliderLine.style.left = `${clamped}%`;
      }
      if (sliderKnob) {
        sliderKnob.style.left = `${clamped}%`;
        sliderKnob.setAttribute('aria-valuenow', Math.round(clamped));
      }

      updateLabels(clamped);

      animationFrameId = null;
    }

    function runSpringPhysics(snapTarget) {
      if (springAnimId) cancelAnimationFrame(springAnimId);
      const stiffness = 0.12;
      const damping = 0.72;

      function springStep() {
        const force = (snapTarget - currentPosition) * stiffness;
        springVelocity = (springVelocity + force) * damping;
        currentPosition += springVelocity;
        
        updateSlider(currentPosition);

        if (Math.abs(springVelocity) > 0.04 || Math.abs(snapTarget - currentPosition) > 0.08) {
          springAnimId = requestAnimationFrame(springStep);
        } else {
          currentPosition = snapTarget;
          updateSlider(currentPosition);
          springAnimId = null;
          springVelocity = 0;
        }
      }

      springAnimId = requestAnimationFrame(springStep);
    }

    function handleStart(clientX) {
      if (springAnimId) {
        cancelAnimationFrame(springAnimId);
        springAnimId = null;
        springVelocity = 0;
      }
      isDragging = true;
      container.classList.add('dragging');
      handleMove(clientX);
    }

    function handleMove(clientX) {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      const x = clientX - rect.left;
      targetPosition = (x / rect.width) * 100;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => updateSlider());
      }
    }

    function handleRelease() {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove('dragging');

      let snapTarget = 50;
      if (currentPosition < 15) {
        snapTarget = 0;
      } else if (currentPosition > 85) {
        snapTarget = 100;
      } else {
        snapTarget = 50;
      }

      runSpringPhysics(snapTarget);
    }

    // Mouse Listeners
    if (sliderKnob) {
      sliderKnob.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX);
      });

      // Keyboard accessibility
      sliderKnob.addEventListener('keydown', (e) => {
        if (springAnimId) {
          cancelAnimationFrame(springAnimId);
          springAnimId = null;
        }

        let newPosition = currentPosition;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          newPosition -= 5;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          newPosition += 5;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newPosition = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newPosition = 100;
        }
        updateSlider(newPosition);
      });
    }

    container.addEventListener('mousedown', (e) => {
      if (sliderKnob && e.target === sliderKnob) return;
      handleStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    window.addEventListener('mouseup', handleRelease);

    // Touch Support
    if (sliderKnob) {
      sliderKnob.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX);
      }, { passive: false });
    }

    container.addEventListener('touchstart', (e) => {
      if (sliderKnob && e.target === sliderKnob) return;
      if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', handleRelease);

    // Initial position
    updateSlider(50);
  });
}

/**
 * Initializes the full-screen interactive Lightbox with swipe, zoom, captions, and keyboard nav
 */
export function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('[data-lightbox-trigger]');
  if (galleryItems.length === 0) return;

  // Build or reuse Lightbox Modal in DOM
  let modal = document.getElementById('projectLightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'projectLightbox';
    modal.className = 'case-lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image Gallery Lightbox');
    modal.innerHTML = `
      <div class="case-lightbox-backdrop" data-action="close"></div>
      <div class="case-lightbox-content">
        <header class="case-lightbox-topbar">
          <span class="case-lightbox-counter" id="lbCounter">1 / 1</span>
          <div class="case-lightbox-tools">
            <button class="case-lightbox-btn" id="lbZoom" aria-label="Toggle zoom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Zoom</span>
            </button>
            <button class="case-lightbox-btn case-lightbox-close" id="lbClose" aria-label="Close Lightbox (Esc)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </header>

        <div class="case-lightbox-viewport" id="lbViewport">
          <button class="case-lightbox-nav prev" id="lbPrev" aria-label="Previous photo (Left arrow)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="case-lightbox-image-wrap" id="lbImgWrap">
            <img id="lbImage" src="" alt="Enlarged project view" class="case-lightbox-img" draggable="false" />
          </div>

          <button class="case-lightbox-nav next" id="lbNext" aria-label="Next photo (Right arrow)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <footer class="case-lightbox-caption-bar">
          <p id="lbCaption" class="case-lightbox-caption"></p>
          <span class="case-lightbox-hint">Use arrow keys or swipe to navigate • Esc to close</span>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lbImage = modal.querySelector('#lbImage');
  const lbCounter = modal.querySelector('#lbCounter');
  const lbCaption = modal.querySelector('#lbCaption');
  const lbZoom = modal.querySelector('#lbZoom');
  const lbClose = modal.querySelector('#lbClose');
  const lbPrev = modal.querySelector('#lbPrev');
  const lbNext = modal.querySelector('#lbNext');
  const lbImgWrap = modal.querySelector('#lbImgWrap');
  const lbViewport = modal.querySelector('#lbViewport');

  let imagesList = [];
  let currentIndex = 0;
  let isZoomed = false;

  // Collect image data from DOM items
  galleryItems.forEach((item, index) => {
    item.dataset.galleryIndex = index;
    const imgEl = item.querySelector('img');
    const src = item.getAttribute('data-full-src') || (imgEl ? (imgEl.currentSrc || imgEl.src) : '');
    const caption = item.getAttribute('data-caption') || (imgEl ? imgEl.alt : `Project Photo ${index + 1}`);

    imagesList.push({ src, caption });

    if (!item.dataset.lightboxClickBound) {
      item.dataset.lightboxClickBound = 'true';
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    }
  });

  function openLightbox(index) {
    if (imagesList.length === 0) return;
    currentIndex = index;
    isZoomed = false;
    modal.classList.add('is-open');
    document.body.classList.add('lightbox-locked');
    updateLightboxView();
  }

  function closeLightbox() {
    modal.classList.remove('is-open');
    document.body.classList.remove('lightbox-locked');
    resetZoom();
  }

  function showNext() {
    if (imagesList.length <= 1) return;
    currentIndex = (currentIndex + 1) % imagesList.length;
    resetZoom();
    updateLightboxView();
  }

  function showPrev() {
    if (imagesList.length <= 1) return;
    currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
    resetZoom();
    updateLightboxView();
  }

  function resetZoom() {
    isZoomed = false;
    if (lbImage) {
      lbImage.classList.remove('is-zoomed');
      lbImage.style.transform = '';
    }
    if (lbZoom) {
      lbZoom.querySelector('span').textContent = 'Zoom';
    }
  }

  function toggleZoom() {
    isZoomed = !isZoomed;
    if (lbImage) {
      lbImage.classList.toggle('is-zoomed', isZoomed);
    }
    if (lbZoom) {
      lbZoom.querySelector('span').textContent = isZoomed ? 'Reset' : 'Zoom';
    }
  }

  function updateLightboxView() {
    const current = imagesList[currentIndex];
    if (!current) return;

    if (lbImage) {
      lbImage.style.opacity = '0';
      lbImage.src = current.src;
      lbImage.alt = current.caption;
      lbImage.onload = () => {
        lbImage.style.opacity = '1';
      };
    }

    if (lbCounter) {
      lbCounter.textContent = `${currentIndex + 1} / ${imagesList.length}`;
    }

    if (lbCaption) {
      lbCaption.textContent = current.caption;
    }
  }

  // Bind controls once
  if (!modal.dataset.eventsBound) {
    modal.dataset.eventsBound = 'true';

    lbClose.addEventListener('click', closeLightbox);
    modal.querySelector('[data-action="close"]').addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);
    lbZoom.addEventListener('click', toggleZoom);

    // Double click to zoom
    if (lbImgWrap) {
      lbImgWrap.addEventListener('dblclick', toggleZoom);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      } else if (e.key === '+' || e.key === '=') {
        if (!isZoomed) toggleZoom();
      } else if (e.key === '-') {
        if (isZoomed) toggleZoom();
      }
    });

    // Touch Swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    if (lbViewport) {
      lbViewport.addEventListener('touchstart', (e) => {
        if (isZoomed) return; // Do not swipe if zoomed in
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      lbViewport.addEventListener('touchend', (e) => {
        if (isZoomed) return;
        if (e.changedTouches && e.changedTouches[0]) {
          touchEndX = e.changedTouches[0].clientX;
          touchEndY = e.changedTouches[0].clientY;
          handleSwipe();
        }
      }, { passive: true });
    }

    function handleSwipe() {
      const deltaX = touchStartX - touchEndX;
      const deltaY = Math.abs(touchStartY - touchEndY);
      // Require horizontal swipe of at least 45px and dominant over vertical
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > deltaY) {
        if (deltaX > 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    }
  }
}

/**
 * Initializes project share and copy link functionality
 */
export function initProjectShare() {
  const shareBtn = document.getElementById('shareProjectBtn');
  if (!shareBtn || shareBtn.dataset.shareBound) return;
  shareBtn.dataset.shareBound = 'true';

  shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = window.location.href;
    const title = document.title;
    const shareText = `Check out this interior project by MITRA Interior & Constructions: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url
        });
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      const originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Link Copied!</span>
      `;
      shareBtn.classList.add('copied');
      setTimeout(() => {
        shareBtn.innerHTML = originalText;
        shareBtn.classList.remove('copied');
      }, 2500);
    } catch (err) {
      alert(`Project Link: ${url}`);
    }
  });
}

/**
 * Smooth scrolls hero down to narrative story
 */
export function initHeroScrollCue() {
  const cue = document.getElementById('caseHeroScrollCue');
  if (!cue || cue.dataset.scrollBound) return;
  cue.dataset.scrollBound = 'true';

  cue.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('story');
    if (target) {
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -90, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
}

/**
 * Master initializer for all Case Study page features
 */
export function initProjectDetail() {
  initComparisonSliders();
  initGalleryLightbox();
  initProjectShare();
  initHeroScrollCue();
}

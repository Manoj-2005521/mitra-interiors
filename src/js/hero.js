// --- src/js/hero.js ---

let globalHeroCleanup = null;

export function cleanupHeroSlider() {
  if (typeof globalHeroCleanup === 'function') {
    try {
      globalHeroCleanup();
    } catch (e) {
      console.warn('Error during hero cleanup:', e);
    }
    globalHeroCleanup = null;
  }
}

export function initHeroSlider() {
  cleanupHeroSlider();
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  const cursor = slider.querySelector('.hero-cursor');
  const circle = slider.querySelector('.hero-cursor__circle');
  const liveRegion = slider.querySelector('.hero-live');
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  let current = 0;
  let autoplayTimer = null;
  let isPaused = false;
  const AUTOPLAY_DELAY = 5000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)');

  // --- Slide Navigation ---
  function goToSlide(index) {
    if (index === current || index < 0 || index >= totalSlides) return;

    // Deactivate current
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    // Activate new
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    // Accessibility announcement
    if (liveRegion) {
      const label = slides[current].getAttribute('aria-label') || `Slide ${current + 1}`;
      liveRegion.textContent = label;
    }

    // Preload adjacent slide images
    preloadSlide((current + 1) % totalSlides);

    // Reset autoplay timer
    resetAutoplay();
  }

  function nextSlide() {
    goToSlide((current + 1) % totalSlides);
  }

  function prevSlide() {
    goToSlide((current - 1 + totalSlides) % totalSlides);
  }

  // --- Preload adjacent slide images ---
  function preloadSlide(index) {
    const img = slides[index]?.querySelector('.hero-slide__room img');
    if (img && img.loading === 'lazy') {
      img.loading = 'eager';
    }
  }

  // --- Autoplay & Circular Progress ---
  let autoplayStartTime = null;
  let autoplayElapsedTime = 0;
  let progressFrameId = null;

  function updateProgress() {
    if (isPaused) {
      autoplayStartTime = null;
      return;
    }

    const now = performance.now();
    if (!autoplayStartTime) {
      autoplayStartTime = now - autoplayElapsedTime;
    }

    autoplayElapsedTime = now - autoplayStartTime;

    if (autoplayElapsedTime >= AUTOPLAY_DELAY) {
      autoplayElapsedTime = 0;
      autoplayStartTime = now;
      nextSlide();
      return;
    }

    const progress = autoplayElapsedTime / AUTOPLAY_DELAY;
    const offset = 150.8 - (progress * 150.8);

    if (circle) {
      circle.style.strokeDashoffset = offset;
    }

    progressFrameId = requestAnimationFrame(updateProgress);
  }

  function startAutoplay() {
    stopAutoplay();
    if (!isPaused) {
      autoplayStartTime = performance.now() - autoplayElapsedTime;
      progressFrameId = requestAnimationFrame(updateProgress);
    }
  }

  function stopAutoplay() {
    if (progressFrameId) {
      cancelAnimationFrame(progressFrameId);
      progressFrameId = null;
    }
  }

  globalHeroCleanup = () => {
    stopAutoplay();
  };

  function resetAutoplay() {
    autoplayElapsedTime = 0;
    autoplayStartTime = null;
    stopAutoplay();
    startAutoplay();
  }

  function pauseAutoplay() {
    isPaused = true;
    stopAutoplay();
  }

  function resumeAutoplay() {
    isPaused = false;
    startAutoplay();
  }

  // --- Event Listeners: Navigation ---
  slider.addEventListener('click', (e) => {
    // Dead-zone protection: don't change slide if clicking text, dots, links, or buttons
    if (e.target.closest('.hero-slide__content') || e.target.closest('.hero-dot') || e.target.closest('a') || e.target.closest('button')) return;

    const rect = slider.getBoundingClientRect();
    const xPercent = (e.clientX - rect.left) / rect.width;

    // Trigger click pulse animation
    if (cursor) {
      cursor.classList.add('is-clicked');
      setTimeout(() => cursor.classList.remove('is-clicked'), 300);
    }
    
    if (xPercent < 0.5) {
      prevSlide();
    } else {
      nextSlide();
    }
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-dot'), 10);
      goToSlide(index);
    });
  });

  // --- Event Listeners: Pause/Resume ---
  // Pause autoplay immediately when cursor is manually active inside the hero
  slider.addEventListener('mouseenter', pauseAutoplay);
  slider.addEventListener('mouseleave', resumeAutoplay);
  slider.addEventListener('focusin', pauseAutoplay);
  slider.addEventListener('focusout', resumeAutoplay);
  slider.addEventListener('touchstart', pauseAutoplay, { passive: true });
  slider.addEventListener('touchend', () => {
    setTimeout(resumeAutoplay, 2000);
  }, { passive: true });

  const interactiveElements = slider.querySelectorAll('a, button, .hero-dot');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', pauseAutoplay);
    el.addEventListener('mouseleave', resumeAutoplay);
  });

  // --- Keyboard Navigation ---
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prevSlide(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { nextSlide(); e.preventDefault(); }
  });

  // --- Touch Swipe ---
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // --- Mouse Parallax & Custom Cursor ---
  let hasMouseMoved = false;

  slider.addEventListener('mousemove', () => { hasMouseMoved = true; }, { once: true });
  slider.addEventListener('touchstart', () => { hasMouseMoved = true; }, { once: true });

  if (!reducedMotion && !isMobile.matches) {
    let cursorTargetX = window.innerWidth / 2;
    let cursorTargetY = window.innerHeight / 2;
    let cursorCurrentX = cursorTargetX;
    let cursorCurrentY = cursorTargetY;

    slider.addEventListener('mousemove', (e) => {
      // If user is currently in a tutorial hint, don't hijack yet
      if (cursor.classList.contains('is-hinting')) return;

      const rect = slider.getBoundingClientRect();
      const xPercent = (e.clientX - rect.left) / rect.width;

      cursorTargetX = e.clientX;
      cursorTargetY = e.clientY;

      // Dead-zone: hide cursor and use native pointer if hovering text or UI elements
      const isInteractive = e.target.closest('.hero-slide__content') || 
                            e.target.closest('.hero-dots') || 
                            e.target.closest('a') || 
                            e.target.closest('button');

      if (isInteractive) {
        if (cursor) cursor.classList.remove('is-visible', 'is-left', 'is-right');
        slider.classList.remove('hide-cursor', 'nav-hover-left', 'nav-hover-right');
        return;
      }

      if (cursor) {
        const thumbnail = cursor.querySelector('.hero-cursor__thumbnail');
        
        if (xPercent < 0.5) {
          // Hovering Left
          cursor.classList.add('is-visible', 'is-left');
          cursor.classList.remove('is-right');
          slider.classList.add('hide-cursor', 'nav-hover-left');
          slider.classList.remove('nav-hover-right');

          // Fetch previous slide image for thumbnail
          const targetIndex = (current - 1 + totalSlides) % totalSlides;
          const targetImg = slides[targetIndex]?.querySelector('.hero-slide__room img');
          const targetSrc = targetImg ? (targetImg.currentSrc || targetImg.src) : '';
          if (thumbnail && targetSrc) {
            thumbnail.src = targetSrc;
          }
        } else {
          // Hovering Right
          cursor.classList.add('is-visible', 'is-right');
          cursor.classList.remove('is-left');
          slider.classList.add('hide-cursor', 'nav-hover-right');
          slider.classList.remove('nav-hover-left');

          // Fetch next slide image for thumbnail
          const targetIndex = (current + 1) % totalSlides;
          const targetImg = slides[targetIndex]?.querySelector('.hero-slide__room img');
          const targetSrc = targetImg ? (targetImg.currentSrc || targetImg.src) : '';
          if (thumbnail && targetSrc) {
            thumbnail.src = targetSrc;
          }
        }
      }
    });

    slider.addEventListener('mouseleave', () => {
      if (cursor.classList.contains('is-hinting')) return;
      if (cursor) cursor.classList.remove('is-visible', 'is-left', 'is-right');
      slider.classList.remove('hide-cursor', 'nav-hover-left', 'nav-hover-right');
    });

    function animateParallax() {
      // Don't update coordinates inline during load wiggles
      if (cursor && cursor.classList.contains('is-hinting')) {
        requestAnimationFrame(animateParallax);
        return;
      }

      const dx = cursorTargetX - cursorCurrentX;
      const dy = cursorTargetY - cursorCurrentY;
      
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        cursorCurrentX += dx * 0.15;
        cursorCurrentY += dy * 0.15;

        if (cursor) {
          cursor.style.setProperty('--cx', `${cursorCurrentX}px`);
          cursor.style.setProperty('--cy', `${cursorCurrentY}px`);
        }
      }

      requestAnimationFrame(animateParallax);
    }

    requestAnimationFrame(animateParallax);
  }

  // --- One-Time Tutorial Hint ---
  if (!reducedMotion && !isMobile.matches) {
    setTimeout(() => {
      // Trigger tutorial only if the visitor hasn't moved their mouse or touched the screen yet
      if (!hasMouseMoved) {
        const nextImg = slides[(current + 1) % totalSlides]?.querySelector('.hero-slide__room img');
        const nextSrc = nextImg ? (nextImg.currentSrc || nextImg.src) : '';
        const thumbnail = cursor.querySelector('.hero-cursor__thumbnail');
        
        if (thumbnail && nextSrc) {
          thumbnail.src = nextSrc;
        }

        if (cursor) {
          cursor.classList.add('is-hinting', 'is-visible', 'is-right');
        }
        
        // Temporarily pause autoplay during cue
        pauseAutoplay();

        setTimeout(() => {
          if (cursor) {
            cursor.classList.remove('is-hinting');
            // Hide the cursor if the user is still not hovering the slider manually
            const isMouseOverSlider = slider.matches(':hover');
            if (!isMouseOverSlider) {
              cursor.classList.remove('is-visible', 'is-right');
            }
          }
          resumeAutoplay();
        }, 2200);
      }
    }, 1800);
  }

  // Preload first adjacent slide + start autoplay
  preloadSlide(1);
  startAutoplay();
}

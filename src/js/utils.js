// --- src/js/utils.js ---

// Initialize Smooth Scrolling (Lenis)
export function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    // Retain native momentum scrolling on mobile touch screens
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return null;
    }
    if (window.lenis) {
      return window.lenis;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    window.lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return lenis;
  }
  return null;
}

// Scroll Reveal Observer
export function initScrollReveal() {
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur';
  const revealElements = document.querySelectorAll(revealSelectors);
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target); // Unobserve once animated to free resources and boost scroll performance
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }
}

// Toast System
export function showToast(toastEl, message, type = "success") {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = `toast-message ${type}`;
  
  clearTimeout(toastEl.timeoutId);
  
  toastEl.timeoutId = setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(8px)';
    setTimeout(() => {
      toastEl.className = 'toast-message';
      toastEl.style.opacity = '';
      toastEl.style.transform = '';
    }, 400);
  }, 7000);
}

// Number Counters (Trust Strip)
export function initNumberCounters() {
  const counters = document.querySelectorAll('[data-count]:not([data-counter-bound])');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        let startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const currentValue = Math.floor(progress * targetValue);
          
          el.textContent = currentValue + suffix;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = targetValue + suffix;
          }
        }
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => {
    c.setAttribute('data-counter-bound', 'true');
    observer.observe(c);
  });
}

// Magnetic Button Effect
export function initMagneticButtons() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const magnets = document.querySelectorAll('.btn, .hero-cta, .hero-dot, .burger, .close');
  magnets.forEach(magnet => {
    if (magnet.dataset.magnetBound) return;
    magnet.dataset.magnetBound = 'true';
    let ticking = false;
    magnet.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = magnet.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          magnet.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    magnet.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => {
        magnet.style.transform = 'translate(0, 0)';
      });
    });
  });
}

// 3D Card Hover Tilt Effect
export function initHoverTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const targets = document.querySelectorAll('.p-card, .strip-item');
  targets.forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = 'true';
    card.style.transformStyle = 'preserve-3d';
    let ticking = false;
    
    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((centerY - y) / centerY) * 6; // Max 6 degrees rotation
          const rotateY = ((x - centerX) / centerX) * 6;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          ticking = false;
        });
        ticking = true;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  });
}

// Split Word/Text Slide-up Reveals
export function initTextReveals() {
  const texts = document.querySelectorAll('.reveal-text');
  if (texts.length === 0) return;

  texts.forEach(text => {
    if (text.querySelector('.reveal-word')) return;
    const content = text.textContent.trim();
    const words = content.split(/\s+/);
    text.innerHTML = words.map(word => `<span class="reveal-word-wrapper"><span class="reveal-word">${word}</span></span>`).join(' ');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  texts.forEach(t => observer.observe(t));
}

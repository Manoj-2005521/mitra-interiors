/* ==========================================================================
   MITRA Interior & Constructions — Modular Application Entry
   With Seamless SaaS-Style Page Transitions (View Transitions API + Fallback)
   ========================================================================== */

import { 
  initSmoothScroll, 
  initScrollReveal,
  initNumberCounters,
  initMagneticButtons,
  initHoverTilt,
  initTextReveals
} from './utils.js';
import { initNavigation, updateHeaderState, updateActiveNav } from './navigation.js';
import { initHeroSlider } from './hero.js';
import { initPortfolio } from './portfolio.js';
import { initProcess } from './process.js';
import { initForms } from './forms.js';
import { initPageTransitions } from './transitions.js';
import { initProjectDetail } from './project-detail.js';
import { initBentoGrid } from './bento.js';
import { initTechPolish } from './tech-polish.js';

// --- Accordion FAQ Component ---
export function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (header && answer && !header.dataset.faqBound) {
      header.dataset.faqBound = 'true';
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('open');
          const otherHeader = otherItem.querySelector('.faq-q');
          const otherAnswer = otherItem.querySelector('.faq-a');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
}

// --- Testimonials Carousel Component ---
let testimonialInterval = null;

export function cleanupTestimonials() {
  if (testimonialInterval) {
    clearInterval(testimonialInterval);
    testimonialInterval = null;
  }
}

export function initTestimonials() {
  cleanupTestimonials();

  const slides = document.querySelectorAll('.testi-slide');
  const testiNav = document.getElementById('testiNav');
  const testiTrack = document.querySelector('.testi-track');

  if (slides.length === 0 || !testiNav) return;

  // Clear any existing dots
  testiNav.innerHTML = '';
  let currentSlide = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    dot.setAttribute('aria-label', `Navigate to testimonial slide ${index + 1}`);
    
    dot.addEventListener('click', () => {
      goSlide(index);
      resetTestimonialTimer();
    });
    testiNav.appendChild(dot);
  });

  function goSlide(index) {
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
    document.querySelectorAll('.testi-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
      dot.setAttribute('aria-selected', idx === index ? 'true' : 'false');
    });
    currentSlide = index;
  }

  function startTestimonialTimer() {
    testimonialInterval = setInterval(() => {
      goSlide((currentSlide + 1) % slides.length);
    }, 6000);
  }

  function resetTestimonialTimer() {
    clearInterval(testimonialInterval);
    startTestimonialTimer();
  }

  startTestimonialTimer();

  // Swipe support for touch screens
  if (testiTrack && !testiTrack.dataset.swipeBound) {
    testiTrack.dataset.swipeBound = 'true';
    let tStartX = 0;
    let tEndX = 0;
    testiTrack.addEventListener('touchstart', (e) => {
      tStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    testiTrack.addEventListener('touchend', (e) => {
      tEndX = e.changedTouches[0].screenX;
      const diff = tStartX - tEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goSlide((currentSlide + 1) % slides.length);
        } else {
          goSlide((currentSlide - 1 + slides.length) % slides.length);
        }
        resetTestimonialTimer();
      }
    }, { passive: true });
  }
}

/**
 * Re-initializes all UI components when a new page is rendered or transitioned into
 */
export function reinitPage(url = null) {
  const pathname = url ? url.pathname : window.location.pathname;

  // 1. Navigation & Header State
  updateHeaderState();
  updateActiveNav(pathname);

  // 2. Micro-Interactions & Observers
  initScrollReveal();
  initNumberCounters();
  initMagneticButtons();
  initHoverTilt();
  initTextReveals();

  // 3. Page Modules
  initHeroSlider();
  initPortfolio();
  initProcess();
  initForms();
  initFaqAccordion();
  initTestimonials();
  initProjectDetail();
  initBentoGrid();
  initTechPolish();

  // 4. Lucide Vector Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Initial Boot on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Smooth Scrolling (Lenis)
  initSmoothScroll();

  // Initialize Global Navigation listeners
  initNavigation();

  // Initialize Components on Initial Page Load
  reinitPage();

  // Initialize Single-Page Seamless Page Transitions
  initPageTransitions({
    onPageChange: (targetUrl) => {
      reinitPage(targetUrl);
    }
  });
});

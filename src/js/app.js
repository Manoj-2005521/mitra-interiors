/* ==========================================================================
   MITRA Interior & Constructions — Modular Application Entry
   ========================================================================== */

import { 
  initSmoothScroll, 
  initScrollReveal,
  initNumberCounters,
  initMagneticButtons,
  initHoverTilt,
  initTextReveals
} from './utils.js';
import { initNavigation } from './navigation.js';
import { initHeroSlider } from './hero.js';
import { initPortfolio } from './portfolio.js';
import { initProcess } from './process.js';
import { initForms } from './forms.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Utilities & Micro-Interactions
  initSmoothScroll();
  initScrollReveal();
  initNumberCounters();
  initMagneticButtons();
  initHoverTilt();
  initTextReveals();

  // 2. Core Navigation
  initNavigation();

  // 3. Page Specific Modules
  initHeroSlider();
  initPortfolio();
  initProcess();

  // 4. Forms & Interactive Features
  initForms();

  // 5. Accordion FAQ (Simple enough to keep inline)
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const header = item.querySelector('.faq-q');
      const answer = item.querySelector('.faq-a');
      if (header && answer) {
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

  // 6. Testimonials Carousel
  const slides = document.querySelectorAll('.testi-slide');
  const testiNav = document.getElementById('testiNav');
  let currentSlide = 0;
  let testimonialInterval;

  if (slides.length > 0 && testiNav) {
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

    // Swipe support for Testimonials Slider
    const testiTrack = document.querySelector('.testi-track');
    if (testiTrack) {
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

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

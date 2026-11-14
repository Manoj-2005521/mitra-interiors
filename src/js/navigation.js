// --- src/js/navigation.js ---

export function updateHeaderState() {
  const headerEl = document.getElementById('siteHeader');
  const hasHero = document.querySelector('.hero-slider, [class*="-hero"], .hero') !== null;
  if (headerEl) {
    if (!hasHero) {
      headerEl.classList.add('scrolled');
    } else if (window.scrollY > 80) {
      headerEl.classList.add('scrolled');
    } else {
      headerEl.classList.remove('scrolled');
    }
  }
}

export function updateActiveNav(pathname = window.location.pathname) {
  const normalizedPath = pathname === '' || pathname === '/' ? '/' : pathname;
  
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a, .mega a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Match root/home
    const isHome = (href === '/' || href === '/index.html' || href === 'index.html') && 
                   (normalizedPath === '/' || normalizedPath.endsWith('/index.html') || normalizedPath.endsWith('/'));
    
    // Match exact path
    const isExact = href === normalizedPath || 
                    href === normalizedPath.replace(/^\//, '') ||
                    ('/' + href.replace(/^\//, '')) === normalizedPath;

    // Check if sub-service page belongs to Services category
    const isServiceSubpage = normalizedPath.includes('kitchen') || 
                             normalizedPath.includes('wardrobe') || 
                             normalizedPath.includes('living') || 
                             normalizedPath.includes('tv-units') || 
                             normalizedPath.includes('bedroom') || 
                             normalizedPath.includes('ceiling') || 
                             normalizedPath.includes('furniture') || 
                             normalizedPath.includes('renovation') || 
                             normalizedPath.includes('construction') || 
                             normalizedPath.includes('commercial');
    const isParentServices = isServiceSubpage && href === '/services.html';

    const isMatch = isHome || isExact || isParentServices;

    if (isMatch) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    } else {
      link.removeAttribute('aria-current');
      link.classList.remove('active');
    }
  });
}

export function initNavigation() {
  updateHeaderState();
  updateActiveNav();

  if (window._navInitialized) return;
  window._navInitialized = true;

  // HEADER NAV SCROLL EFFECTS
  let lastScrollY = window.scrollY;
  const headerEl = document.getElementById('siteHeader');
  const progressEl = document.getElementById('progress');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // 1. Scroll Progress Bar
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0 && progressEl) {
          const percentage = currentScrollY / totalHeight;
          progressEl.style.transform = `scaleX(${percentage})`;
        }

        // 2. Hide Navbar on Scroll Down, Show on Scroll Up
        if (headerEl) {
          if (currentScrollY > lastScrollY && currentScrollY > 140) {
            headerEl.classList.add('hide');
          } else {
            headerEl.classList.remove('hide');
          }
          
          // Keep solid/scrolled state on subpages, toggle only on pages with a hero
          const currentHasHero = document.querySelector('.hero-slider, [class*="-hero"], .hero') !== null;
          if (!currentHasHero) {
            headerEl.classList.add('scrolled');
          } else {
            headerEl.classList.toggle('scrolled', currentScrollY > 80);
          }
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // HELPER FOR ACCESSIBLE FOCUS TRAPPING
  function trapFocus(e, container) {
    const focusableEls = container.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusableEls.length === 0) return;
    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  }

  // MOBILE NAVIGATION OVERLAY
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  if (burgerBtn && mobileMenu && closeMenu) {
    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Lock background scroll
      closeMenu.focus();
    };

    const closeMenuFunc = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // Unlock background scroll
      burgerBtn.focus();
    };

    burgerBtn.addEventListener('click', openMenu);
    closeMenu.addEventListener('click', closeMenuFunc);
    
    // Close when clicking mobile menu links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenuFunc);
    });

    // Close when clicking outside content area
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        closeMenuFunc();
      }
    });

    // Keyboard handlers (Escape to close, Tab to trap focus)
    mobileMenu.addEventListener('keydown', (e) => {
      if (mobileMenu.classList.contains('open')) {
        if (e.key === 'Escape') {
          closeMenuFunc();
        } else if (e.key === 'Tab') {
          trapFocus(e, mobileMenu);
        }
      }
    });
  }

  // FAB (FLOATING ACTION BUTTON) INTERACTION
  const fabWrapper = document.getElementById('fabWrapper');
  const fabBtn = document.getElementById('fabBtn');
  const fabMenu = document.getElementById('fabMenu');

  if (fabWrapper && fabBtn && fabMenu) {
    const openFabFunc = () => {
      fabWrapper.classList.add('active');
      fabBtn.setAttribute('aria-expanded', 'true');
      fabMenu.setAttribute('aria-hidden', 'false');
      
      // Move focus to first menuitem when open
      const firstItem = fabMenu.querySelector('.fab-item');
      if (firstItem) firstItem.focus();
    };

    const closeFabFunc = () => {
      fabWrapper.classList.remove('active');
      fabBtn.setAttribute('aria-expanded', 'false');
      fabMenu.setAttribute('aria-hidden', 'true');
      fabBtn.focus();
    };

    const toggleFab = () => {
      const isOpen = fabWrapper.classList.contains('active');
      if (isOpen) {
        closeFabFunc();
      } else {
        openFabFunc();
      }
    };

    fabBtn.addEventListener('click', toggleFab);

    // Close when clicking outside of the FAB wrapper (only if active)
    document.addEventListener('click', (e) => {
      if (fabWrapper.classList.contains('active') && !fabWrapper.contains(e.target)) {
        closeFabFunc();
      }
    });

    // Keyboard accessibility handlers inside FAB
    fabWrapper.addEventListener('keydown', (e) => {
      if (fabWrapper.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeFabFunc();
        } else if (e.key === 'Tab') {
          trapFocus(e, fabWrapper);
        }
      }
    });
  }
}

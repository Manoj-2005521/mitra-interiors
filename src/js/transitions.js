// --- src/js/transitions.js ---
// MITRA Interior & Constructions — Seamless Page Transition System (SaaS / App Style)
// Leverages Native View Transitions API with fluid fallback, prefetching, and state syncing.

const pageCache = new Map();
let isNavigating = false;
let loadingBarEl = null;
let loadingTimeout = null;

/**
 * Normalizes a URL to origin + pathname + search (excluding hash) for caching
 */
function getCleanUrl(urlStr) {
  try {
    const url = new URL(urlStr, window.location.href);
    return url.origin + url.pathname + url.search;
  } catch (e) {
    return urlStr;
  }
}

/**
 * Checks whether an anchor element is an internal link eligible for smooth transition
 */
function isInternalLink(anchor) {
  if (!anchor || anchor.tagName !== 'A') return false;
  const href = anchor.getAttribute('href');
  if (!href) return false;

  // Ignore special protocol links, downloads, and blank targets
  if (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:') ||
    anchor.getAttribute('target') === '_blank' ||
    anchor.hasAttribute('download')
  ) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    // Must be same origin
    if (url.origin !== window.location.origin) return false;
    
    // Ignore non-HTML static file links like images, pdfs, zips
    const ext = url.pathname.split('.').pop().toLowerCase();
    const nonHtmlExts = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'pdf', 'zip', 'mp4', 'webm', 'xml', 'txt'];
    if (nonHtmlExts.includes(ext)) return false;

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Top loading bar for subtle feedback during page fetch (Linear / Vercel style)
 */
function createLoadingBar() {
  if (loadingBarEl) return loadingBarEl;
  let bar = document.querySelector('.page-loading-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'page-loading-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  loadingBarEl = bar;
  return loadingBarEl;
}

function startLoadingBar() {
  const bar = createLoadingBar();
  clearTimeout(loadingTimeout);
  // Show bar only if fetch takes more than 70ms to prevent visual jitter on instant cached pages
  loadingTimeout = setTimeout(() => {
    if (bar) {
      bar.classList.remove('is-done');
      bar.classList.add('is-loading');
    }
  }, 70);
}

function stopLoadingBar() {
  clearTimeout(loadingTimeout);
  if (loadingBarEl) {
    loadingBarEl.classList.remove('is-loading');
    loadingBarEl.classList.add('is-done');
    setTimeout(() => {
      loadingBarEl.classList.remove('is-done');
    }, 450);
  }
}

/**
 * Prefetch target page HTML and cache in memory for instant 0ms response
 */
export function prefetchPage(href) {
  if (!href) return;
  const cleanUrl = getCleanUrl(href);
  if (pageCache.has(cleanUrl)) return;

  const fetchPromise = fetch(cleanUrl, {
    headers: { 'X-Requested-With': 'Page-Transition' }
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .catch(err => {
      // Evict failed requests so retry can happen
      pageCache.delete(cleanUrl);
      return null;
    });

  pageCache.set(cleanUrl, fetchPromise);
}

/**
 * Dynamically loads and inserts page-specific stylesheets from the incoming document
 */
async function syncPageStylesheets(doc) {
  const incomingLinks = doc.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]');
  const loadPromises = [];

  incomingLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if stylesheet is already in current document
    const exists = document.head.querySelector(`link[href="${href}"]`);
    if (!exists) {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = href;

      const p = new Promise(resolve => {
        newLink.onload = () => resolve();
        newLink.onerror = () => resolve(); // Don't block transition on CSS load error
        setTimeout(resolve, 800); // 800ms safety timeout
      });

      loadPromises.push(p);
      document.head.appendChild(newLink);
    }
  });

  if (loadPromises.length > 0) {
    await Promise.all(loadPromises);
  }
}

/**
 * Updates DOM title, meta tags, and main content
 */
function swapPageContent(doc) {
  // 1. Update Title
  if (doc.title) {
    document.title = doc.title;
  }

  // 2. Update Meta Description
  const newMetaDesc = doc.querySelector('meta[name="description"]');
  const curMetaDesc = document.querySelector('meta[name="description"]');
  if (newMetaDesc && curMetaDesc) {
    curMetaDesc.setAttribute('content', newMetaDesc.getAttribute('content') || '');
  }

  // 3. Update Canonical Tag
  const newCanonical = doc.querySelector('link[rel="canonical"]');
  const curCanonical = document.querySelector('link[rel="canonical"]');
  if (newCanonical && curCanonical) {
    curCanonical.setAttribute('href', newCanonical.getAttribute('href') || '');
  }

  // 4. Update Main Content
  const curMain = document.querySelector('main');
  const newMain = doc.querySelector('main');
  if (curMain && newMain) {
    curMain.innerHTML = newMain.innerHTML;

    // Sync any class or attributes on <main>
    if (newMain.id) curMain.id = newMain.id;
    curMain.className = newMain.className;
  }

  // 5. Update Body classes if any
  if (doc.body && doc.body.className) {
    document.body.className = doc.body.className;
  }
}

/**
 * Closes mobile drawer if it's open
 */
function closeMobileDrawer() {
  const mobileMenu = document.getElementById('mobileMenu');
  const burgerBtn = document.getElementById('burgerBtn');
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (burgerBtn) {
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
  const fabWrapper = document.getElementById('fabWrapper');
  if (fabWrapper && fabWrapper.classList.contains('active')) {
    fabWrapper.classList.remove('active');
  }
}

/**
 * Helper delay
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core navigation function with View Transitions API & fluid fallback
 */
export async function navigateTo(targetHref, options = {}) {
  const { updateHistory = true, onPageChange = null } = options;

  if (isNavigating) return;
  isNavigating = true;

  const targetUrl = new URL(targetHref, window.location.href);
  const cleanUrl = getCleanUrl(targetHref);

  startLoadingBar();

  try {
    // 1. Fetch target HTML (from cache or network)
    let htmlText = null;
    if (pageCache.has(cleanUrl)) {
      htmlText = await pageCache.get(cleanUrl);
    }

    if (!htmlText) {
      const res = await fetch(cleanUrl, {
        headers: { 'X-Requested-With': 'Page-Transition' }
      });
      if (!res.ok) {
        // Fallback to normal navigation on non-200
        window.location.href = targetHref;
        return;
      }
      htmlText = await res.text();
      pageCache.set(cleanUrl, Promise.resolve(htmlText));
    }

    // 2. Parse HTML document
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 3. Ensure any page-specific CSS is ready before swapping view
    await syncPageStylesheets(doc);

    // 4. Perform Transition
    closeMobileDrawer();

    const doSwap = () => {
      swapPageContent(doc);

      // Scroll Restoration
      if (targetUrl.hash) {
        const hashEl = document.querySelector(targetUrl.hash);
        if (hashEl) {
          if (window.lenis) {
            window.lenis.scrollTo(hashEl, { offset: -90, immediate: false, duration: 0.8 });
          } else {
            hashEl.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
          else window.scrollTo(0, 0);
        }
      } else {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }

      // Update URL in History
      if (updateHistory) {
        window.history.pushState({ path: targetUrl.href }, '', targetUrl.href);
      }

      // Trigger re-initialization of components
      if (typeof onPageChange === 'function') {
        onPageChange(targetUrl);
      }

      // Notify any custom listeners
      window.dispatchEvent(new CustomEvent('page:transitioned', { detail: { url: targetUrl } }));
    };

    // Check for native View Transitions API support
    const supportsViewTransitions = typeof document.startViewTransition === 'function';

    if (supportsViewTransitions) {
      const transition = document.startViewTransition(() => {
        doSwap();
      });
      await transition.finished;
    } else {
      // Elegant CSS fallback for older browsers
      const curMain = document.querySelector('main');
      if (curMain) {
        curMain.classList.add('page-is-leaving');
        await sleep(250);
      }

      doSwap();

      if (curMain) {
        curMain.classList.remove('page-is-leaving');
        curMain.classList.add('page-is-entering');
        void curMain.offsetHeight; // Force reflow
        curMain.classList.add('page-is-entered');
        await sleep(280);
        curMain.classList.remove('page-is-entering', 'page-is-entered');
      }
    }

  } catch (error) {
    console.error('Page transition failed, falling back to standard load:', error);
    window.location.href = targetHref;
  } finally {
    stopLoadingBar();
    isNavigating = false;
  }
}

/**
 * Initializes global link click interception, hover prefetching, and popstate handling
 */
export function initPageTransitions({ onPageChange }) {
  // Prevent browser's automatic jumpy scroll on popstate so Lenis/smooth scroll controls it
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  createLoadingBar();

  // 1. Delegated click listener for all links
  document.addEventListener('click', (e) => {
    // Only handle primary left clicks without modifier keys
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const anchor = e.target.closest('a');
    if (!anchor || !isInternalLink(anchor)) return;

    const href = anchor.getAttribute('href');
    const targetUrl = new URL(href, window.location.href);

    // Case A: Link is to an anchor on the CURRENT page (e.g. #faq or /index.html#faq while on index.html)
    const isSamePathname = targetUrl.pathname === window.location.pathname ||
      (targetUrl.pathname === '/' && window.location.pathname.endsWith('/index.html')) ||
      (targetUrl.pathname.endsWith('/index.html') && window.location.pathname === '/');

    if (isSamePathname) {
      if (targetUrl.hash) {
        const hashEl = document.querySelector(targetUrl.hash);
        if (hashEl) {
          e.preventDefault();
          closeMobileDrawer();
          if (window.lenis) {
            window.lenis.scrollTo(hashEl, { offset: -90, duration: 1.0 });
          } else {
            hashEl.scrollIntoView({ behavior: 'smooth' });
          }
          window.history.pushState(null, '', targetUrl.hash);
          return;
        }
      } else {
        // Clicking home/top while on same page -> smooth scroll to top
        e.preventDefault();
        closeMobileDrawer();
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.0 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
    }

    // Case B: Link navigates to another page
    e.preventDefault();
    navigateTo(targetUrl.href, { updateHistory: true, onPageChange });
  });

  // 2. Prefetch links on hover / focus / touchstart for instant navigation
  const handleLinkHover = (e) => {
    const anchor = e.target.closest('a');
    if (anchor && isInternalLink(anchor)) {
      prefetchPage(anchor.getAttribute('href'));
    }
  };

  document.addEventListener('pointerenter', handleLinkHover, { capture: true, passive: true });
  document.addEventListener('focusin', handleLinkHover, { capture: true, passive: true });
  document.addEventListener('touchstart', handleLinkHover, { capture: true, passive: true });

  // 3. Handle browser Back and Forward buttons with popstate
  window.addEventListener('popstate', (e) => {
    navigateTo(window.location.href, { updateHistory: false, onPageChange });
  });
}

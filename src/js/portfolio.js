// --- src/js/portfolio.js ---

export function initPortfolio() {
  // SERVICES DATA & POPULATION
  const svcListContainer = document.getElementById('svcList');
  const svcVisualContainer = document.getElementById('svcVisual');

  if (svcListContainer && svcVisualContainer && !svcListContainer.dataset.portfolioBound) {
    svcListContainer.dataset.portfolioBound = 'true';
    const rows = svcListContainer.querySelectorAll('.svc-row');
    const groups = svcVisualContainer.querySelectorAll('.svc-gallery-group');
    const captionEl = document.getElementById('svcCaption');

    rows.forEach((row, index) => {
      row.addEventListener('mouseenter', () => activateService(index));
      row.addEventListener('click', () => {
        const url = row.getAttribute('data-url');
        if (url) window.location.href = url;
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const url = row.getAttribute('data-url');
          if (url) window.location.href = url;
        }
      });
    });

    groups.forEach((group) => {
      group.addEventListener('click', () => {
        const url = group.getAttribute('data-url');
        if (url) window.location.href = url;
      });
    });

    function activateService(index) {
      rows.forEach((row, idx) => {
        row.classList.toggle('active', idx === index);
      });
      groups.forEach((group, idx) => {
        group.classList.toggle('active', idx === index);
      });
      if (captionEl && rows[index]) {
        captionEl.textContent = rows[index].querySelector('h3').textContent;
      }
    }
  }

  // PROJECTS PORTFOLIO MASONRY
  const masonryGrid = document.getElementById('masonryGrid');
  if (masonryGrid && !masonryGrid.dataset.masonryBound) {
    masonryGrid.dataset.masonryBound = 'true';
    const items = masonryGrid.querySelectorAll('.m-item');
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        const filter = btn.getAttribute('data-filter');
        items.forEach(item => {
          if (filter === 'all' || item.classList.contains(filter)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

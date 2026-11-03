import re

with open('src/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Services logic
new_services = """
  const svcListContainer = document.getElementById('svcList');
  const svcVisualContainer = document.getElementById('svcVisual');

  if (svcListContainer && svcVisualContainer) {
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
"""
content = re.sub(r'const services = \[.*?\n  const svcListContainer = document\.getElementById\(\'svcList\'\);\n.*?}\n  }\n', new_services, content, flags=re.DOTALL)


# 2. Masonry logic
content = re.sub(r'const projects = \[.*?\n  const masonryGrid = document\.getElementById\(\'masonryGrid\'\);\n.*?}\n\n  // Wait for images to load', """
  const masonryGrid = document.getElementById('masonryGrid');
  // Wait for images to load""", content, flags=re.DOTALL)


# 3. FAQ logic
new_faq = """
  const faqListContainer = document.getElementById('faqList');
  if (faqListContainer) {
    const toggles = document.querySelectorAll('.faq-q');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggles.forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if(panel) panel.classList.remove('open');
        });
        if (!isExpanded) {
          toggle.setAttribute('aria-expanded', 'true');
          const panel = document.getElementById(toggle.getAttribute('aria-controls'));
          if(panel) panel.classList.add('open');
        }
      });
    });
  }
"""
content = re.sub(r'const faqData = \[.*?\n  const faqListContainer = document\.getElementById\(\'faqList\'\);\n.*?}\n\n  // ---------- 12', new_faq + "\n\n  // ---------- 12", content, flags=re.DOTALL)

with open('src/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.js")

import re

with open('src/projects.njk', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the extraJs completely with just the filter logic
new_extra_js = """{% set extraJs %}
    // Page-specific filters override
    const pills = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.m-item');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');
        
        items.forEach(item => {
            if(filter === 'all') {
                item.style.display = '';
            } else {
                if(item.classList.contains(filter)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }
        });
      });
    });
{% endset %}"""
content = re.sub(r'{% set extraJs %}.*?{% endset %}', new_extra_js, content, flags=re.DOTALL)

# Replace the masonry grid div
masonry_replacement = """<!-- Masonry Grid -->
      <div class="masonry reveal delay-1" id="portfolioGrid">
        {% for p in portfolio %}
        <div class="m-item {{ p.cat }}" tabindex="0" aria-label="View details for {{ p.title }}">
          <img src="/{{ p.img }}" alt="{{ p.title }}" loading="lazy">
          <div class="m-ov">
            <div class="m-inf">
              <span class="m-loc"><i data-lucide="map-pin" style="width:14px; height:14px;"></i> {{ p.loc }}</span>
              <h3>{{ p.title }}</h3>
              <div class="m-meta">
                <span>{{ p.area }}</span>
                <span>{{ p.dur }}</span>
                <span>{{ p.budget }}</span>
              </div>
            </div>
            <a href="/project-detail.html" class="m-btn" aria-label="Read more about {{ p.title }}" tabindex="-1">View Case Study</a>
          </div>
        </div>
        {% endfor %}
      </div>"""
content = re.sub(r'<!-- Masonry Grid -->\s*<div class="masonry reveal delay-1" id="portfolioGrid">.*?</div>', masonry_replacement, content, flags=re.DOTALL)

with open('src/projects.njk', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated projects.njk")

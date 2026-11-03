import re
import os

def main():
    src_dir = 'src'
    
    # 1. Update index.njk
    index_path = os.path.join(src_dir, 'index.njk')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace svcList
    svc_list_replacement = """<div class="svc-list reveal-left" id="svcList">
            {% for service in services %}
            <div class="svc-row {% if loop.first %}active{% endif %}" role="button" tabindex="0" aria-label="View details for {{ service.t }}" data-index="{{ loop.index0 }}">
              <div class="st">
                <span class="si">0{{ loop.index }}</span>
                <h3>{{ service.t }}</h3>
              </div>
              <span class="arrow" aria-hidden="true">→</span>
            </div>
            {% endfor %}
          </div>"""
    content = re.sub(r'<div class="svc-list reveal-left" id="svcList">.*?</div>', svc_list_replacement, content, flags=re.DOTALL)

    # Replace svcVisual
    svc_visual_replacement = """<div class="svc-visual reveal-right delay-2" id="svcVisual">
            {% for service in services %}
            <div class="svc-gallery-group {% if loop.first %}active{% endif %}" data-index="{{ loop.index0 }}">
              <div class="svc-gallery-item svc-item-main"><img src="/{{ service.imgs[0] }}" alt="{{ service.t }}" loading="lazy"></div>
              <div class="svc-gallery-item svc-item-sub1"><img src="/{{ service.imgs[1] }}" alt="{{ service.t }}" loading="lazy"></div>
              <div class="svc-gallery-item svc-item-sub2"><img src="/{{ service.imgs[2] }}" alt="{{ service.t }}" loading="lazy"></div>
            </div>
            {% endfor %}
            <div class="cap" id="svcCaption">{{ services[0].t }}</div>
          </div>"""
    content = re.sub(r'<div class="svc-visual reveal-right delay-2" id="svcVisual">.*?</div>', svc_visual_replacement, content, flags=re.DOTALL)

    # Replace masonryGrid
    masonry_replacement = """<div class="masonry reveal-scale delay-2" id="masonryGrid">
          {% for p in projects %}
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
    content = re.sub(r'<div class="masonry reveal-scale delay-2" id="masonryGrid">.*?</div>', masonry_replacement, content, flags=re.DOTALL)

    # Replace faqList
    faq_replacement = """<div class="faq-wrap reveal delay-1" id="faqList">
          {% for f in faqs %}
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false" aria-controls="faq-a-{{ loop.index0 }}">
              <span>{{ f.q }}</span>
              <i data-lucide="chevron-down" class="faq-ic"></i>
            </button>
            <div class="faq-a" id="faq-a-{{ loop.index0 }}">
              <div class="faq-a-inner">{{ f.a }}</div>
            </div>
          </div>
          {% endfor %}
        </div>"""
    content = re.sub(r'<div class="faq-wrap reveal delay-1" id="faqList">.*?</div>', faq_replacement, content, flags=re.DOTALL)

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated index.njk")

if __name__ == "__main__":
    main()

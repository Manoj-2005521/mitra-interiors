import json
import re

# 1. Update services.json
with open('src/_data/services.json', 'r', encoding='utf-8') as f:
    services = json.load(f)

url_mapping = {
    "Modular Kitchens": "modular-kitchens.html",
    "Wardrobes & Storage": "wardrobes.html",
    "Living Rooms": "living-rooms.html",
    "TV Units": "tv-units.html",
    "Bedrooms & Beds": "bedrooms.html",
    "False Ceilings & Lighting": "false-ceilings.html",
    "Custom Furniture": "custom-furniture.html",
    "Home Renovation": "home-renovation.html",
    "Construction & Civil Work": "civil-construction.html",
    "Commercial Interiors": "commercial-interiors.html"
}

for s in services:
    if s["t"] in url_mapping:
        s["url"] = url_mapping[s["t"]]
    else:
        s["url"] = "services.html"

with open('src/_data/services.json', 'w', encoding='utf-8') as f:
    json.dump(services, f, indent=2)

# 2. Update index.njk
with open('src/index.njk', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Replace arrow
index_content = index_content.replace('<span class="arrow" aria-hidden="true">→</span>', '<span class="arrow" aria-hidden="true"><i data-lucide="arrow-right"></i></span>')

# Replace svc-row
index_content = index_content.replace('data-index="{{ loop.index0 }}">', 'data-index="{{ loop.index0 }}" data-url="{{ service.url }}">')

with open('src/index.njk', 'w', encoding='utf-8') as f:
    f.write(index_content)

print("Updated services.json and index.njk")

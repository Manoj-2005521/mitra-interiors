import os
import re
import glob

src_dir = 'src'
images_dir = os.path.join(src_dir, 'images')

mapping = {
    'wardrobes.njk': 'Wardrobes',
    'living-rooms.njk': 'Living Rooms',
    'tv-units.njk': 'TV Units',
    'bedrooms.njk': 'Bedrooms',
    'false-ceilings.njk': 'False Ceilings',
    'custom-furniture.njk': 'Custom Furniture',
    'home-renovation.njk': 'Home Renovation',
    'civil-construction.njk': 'Civil Construction',
    'commercial-interiors.njk': 'Commercial Interiors'
}

nunjucks_template = """      <div class="masonry reveal delay-1" id="portfolioGrid" style="margin-top:0;">
        {% set heights = ["320px", "480px", "380px", "520px", "280px", "440px", "350px", "490px"] %}
        {% for img in images %}
        <div class="p-card reveal in" style="cursor: default; transition-delay: {{ loop.index0 * 0.05 }}s;">
          <img src="/{{ img }}" alt="{{ title }}" loading="lazy" style="height: {{ heights[loop.index0 % 8] }}; object-fit:cover; width:100%; border-radius: 8px;">
        </div>
        {% endfor %}
      </div>"""

for filename, folder in mapping.items():
    filepath = os.path.join(src_dir, filename)
    folderpath = os.path.join(images_dir, folder)
    
    if not os.path.exists(filepath): continue
    
    # Get all images in the folder
    images = []
    if os.path.exists(folderpath):
        for img in os.listdir(folderpath):
            if img.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                images.append(f"images/{folder}/{img}")
                
    # Format yaml
    yaml_images = "\n".join([f'  - "{img}"' for img in images])
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace front matter
    if 'images:' not in content:
        content = re.sub(r'(---\n.*?\n)---', f'\\1images:\n{yaml_images}\n---', content, flags=re.DOTALL)
        
    # Remove script block
    content = re.sub(r'<script>.*?</script>', '', content, flags=re.DOTALL)
    
    # Replace portfolioGrid
    content = re.sub(r'<div class="masonry reveal delay-1" id="portfolioGrid".*?</div>', nunjucks_template, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Refactored {filename}")

# Fix modular-kitchens.njk which uses external images
mod_kitch = os.path.join(src_dir, 'modular-kitchens.njk')
if os.path.exists(mod_kitch):
    with open(mod_kitch, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract images from script
    matches = re.findall(r'img:\s*"(.*?)"', content)
    yaml_images = "\n".join([f'  - "{img}"' for img in matches])
    
    if 'images:' not in content:
        content = re.sub(r'(---\n.*?\n)---', f'\\1images:\n{yaml_images}\n---', content, flags=re.DOTALL)
        
    content = re.sub(r'<script>.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="masonry reveal delay-1" id="portfolioGrid".*?</div>', nunjucks_template, content, flags=re.DOTALL)
    
    with open(mod_kitch, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Refactored modular-kitchens.njk")


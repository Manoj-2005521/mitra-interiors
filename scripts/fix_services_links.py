import os

file_path = "src/services.njk"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    '<!-- 1. Modular Kitchen -->': ('<a href="services.html#kitchens"', '<a href="/modular-kitchens.html"'),
    '<!-- 2. Wardrobes -->': ('<a href="services.html#wardrobes"', '<a href="/wardrobes.html"'),
    '<!-- 3. False Ceilings -->': ('<a href="services.html#tv"', '<a href="/false-ceilings.html"'),
    '<!-- 4. Living Rooms -->': ('<a href="services.html#living"', '<a href="/living-rooms.html"'),
    '<!-- 4b. TV Units -->': ('<a href="services.html#tv"', '<a href="/tv-units.html"'),
    '<!-- 5. Bedrooms -->': ('<a href="services.html#bedrooms"', '<a href="/bedrooms.html"'),
    '<!-- 6. Custom Furniture -->': ('<a href="services.html#furniture"', '<a href="/custom-furniture.html"'),
    '<!-- 7. Home Renovation -->': ('<a href="services.html#renovation"', '<a href="/home-renovation.html"'),
    '<!-- 8. Construction -->': ('<a href="services.html#construction"', '<a href="/civil-construction.html"'),
    '<!-- 9. Commercial Interiors -->': ('<a href="services.html#commercial"', '<a href="/commercial-interiors.html"'),
}

# we need to be careful. Let's find the position of the comment and then replace the FIRST occurrence of the link after that comment
for comment, (old_link, new_link) in replacements.items():
    idx = content.find(comment)
    if idx != -1:
        # find the old_link after the comment
        link_idx = content.find(old_link, idx)
        if link_idx != -1 and link_idx < content.find('<!--', idx + len(comment)):
            # Replace it
            content = content[:link_idx] + new_link + content[link_idx + len(old_link):]
            print(f"Replaced {old_link} with {new_link} after {comment}")
        elif link_idx != -1 and comment == '<!-- 9. Commercial Interiors -->':
            # since there's no next comment
            content = content[:link_idx] + new_link + content[link_idx + len(old_link):]
            print(f"Replaced {old_link} with {new_link} after {comment}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

import re

# Read projects.njk
with open("src/projects.njk", "r", encoding="utf-8") as f:
    projects_content = f.read()

# Extract the style block
style_match = re.search(r'<style>\s*(.*?)\s*</style>', projects_content, re.DOTALL)
if style_match:
    style_content = style_match.group(1)
    
    # Append to style.css
    with open("src/style.css", "a", encoding="utf-8") as f:
        f.write("\n\n/* Imported from projects.njk */\n")
        f.write(style_content)
    
    # Remove the style block from projects.njk
    new_projects = projects_content[:style_match.start()] + projects_content[style_match.end():]
    with open("src/projects.njk", "w", encoding="utf-8") as f:
        f.write(new_projects)
        
    print("Successfully moved style block from projects.njk to style.css")
else:
    print("Could not find style block in projects.njk")

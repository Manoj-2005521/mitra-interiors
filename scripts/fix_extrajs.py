import glob
import os

files = glob.glob('src/*.njk')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '{% set extraJs %}' in content:
        content = content.replace('{% set extraJs %}', '<script>')
        content = content.replace('{% endset %}', '</script>')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const pagesCssDir = path.join(srcDir, 'css/pages');

if (!fs.existsSync(pagesCssDir)) {
  fs.mkdirSync(pagesCssDir, { recursive: true });
}

const templates = [
  'about.njk',
  'blog.njk',
  'contact.njk',
  'legal.njk',
  'pricing.njk',
  'process.njk',
  'project-detail.njk',
  'services.njk'
];

templates.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match <style>...</style> block
  const styleRegex = /<style>([\s\S]*?)<\/style>/i;
  const match = content.match(styleRegex);
  
  if (match) {
    let css = match[1].trim();
    
    const cssFileName = file.replace('.njk', '.css');
    fs.writeFileSync(path.join(pagesCssDir, cssFileName), css + '\n');
    
    // Replace style block with Nunjucks extraCss block referencing the new file
    const blockContent = `{% block extraCss %}\n  <link rel="stylesheet" href="/css/pages/${cssFileName}">\n{% endblock %}`;
    
    content = content.replace(styleRegex, blockContent);
    fs.writeFileSync(filePath, content);
    console.log(`Extracted CSS from ${file} to css/pages/${cssFileName}`);
  } else {
    console.log(`No inline style block found in ${file}`);
  }
});

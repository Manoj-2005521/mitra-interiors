const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname + '/..').filter(f => f.endsWith('.html'));
const srcDir = path.join(__dirname, '../src');

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  
  let title = '';
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (titleMatch) title = titleMatch[1];
  
  let description = '';
  const descMatch = content.match(/<meta name="description" content="(.*?)">/);
  if (descMatch) description = descMatch[1];
  
  let extraCss = '';
  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) extraCss = styleMatch[1];
  
  let extraJs = '';
  // Check if there is an extra script tag (excluding lucide and app.js)
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) extraJs = scriptMatch[1];

  let mainContent = '';
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch) {
    mainContent = mainMatch[1].trim();
  } else {
    // If no <main>, just copy everything between header and footer
    const noHeaderMatch = content.match(/<\/header>([\s\S]*?)<footer/);
    if (noHeaderMatch) {
      // Remove mobile menu if present here
      let temp = noHeaderMatch[1].trim();
      temp = temp.replace(/<!-- MOBILE NAVIGATION MENU -->[\s\S]*?<\/div>/, '');
      temp = temp.replace(/<!-- MOBILE NAVIGATION DRAWER[\s\S]*?<\/div>/, '');
      mainContent = temp;
    }
  }

  // Build new content
  let newContent = `---\nlayout: layouts/base.njk\n`;
  if (title) newContent += `title: "${title.replace(/"/g, '\\"')}"\n`;
  if (description) newContent += `description: "${description.replace(/"/g, '\\"')}"\n`;
  newContent += `---\n\n`;

  if (extraCss) {
    newContent += `{% set extraCss %}\n${extraCss.trim()}\n{% endset %}\n\n`;
  }
  if (extraJs) {
    newContent += `{% set extraJs %}\n${extraJs.trim()}\n{% endset %}\n\n`;
  }

  newContent += mainContent;

  fs.writeFileSync(path.join(srcDir, file.replace('.html', '.njk')), newContent);
  console.log(`Migrated ${file}`);
});

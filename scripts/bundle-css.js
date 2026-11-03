const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const srcDir = path.join(__dirname, '../src');
const destDir = path.join(__dirname, '../_site');

function bundleMainCss() {
  const cssDir = path.join(srcDir, 'css');
  const styleCssPath = path.join(srcDir, 'style.css');

  const files = [
    'tokens.css',
    'hero.css',
    'components.css',
    'header.css',
    'footer.css',
    'animations.css'
  ];

  let bundledCss = '';
  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (fs.existsSync(filePath)) {
      bundledCss += `/* --- Bundled: ${file} --- */\n`;
      bundledCss += fs.readFileSync(filePath, 'utf8') + '\n\n';
    } else {
      console.warn(`Warning: CSS file ${file} not found in ${cssDir}`);
    }
  });

  const newContent = bundledCss.trim() + '\n';
  let shouldWrite = true;
  if (fs.existsSync(styleCssPath)) {
    const existingContent = fs.readFileSync(styleCssPath, 'utf8');
    const normalize = str => str.replace(/\r\n/g, '\n').trim();
    if (normalize(existingContent) === normalize(newContent)) {
      shouldWrite = false;
    }
  }

  if (shouldWrite) {
    fs.writeFileSync(styleCssPath, newContent);
    console.log('CSS bundled successfully into src/style.css');
  } else {
    console.log('CSS bundle unchanged, skipping write to src/style.css');
  }
}

async function postprocessCss() {
  const isProd = process.env.NODE_ENV === 'production';
  const plugins = [autoprefixer()];
  
  if (isProd) {
    plugins.push(cssnano({ preset: 'default' }));
    console.log('PostCSS running in PRODUCTION mode (with cssnano minification)');
  } else {
    console.log('PostCSS running in DEVELOPMENT mode (prefixing only)');
  }

  const processor = postcss(plugins);

  // 1. Process style.css inside _site
  const mainStyleDest = path.join(destDir, 'style.css');
  if (fs.existsSync(mainStyleDest)) {
    const cssContent = fs.readFileSync(mainStyleDest, 'utf8');
    try {
      const result = await processor.process(cssContent, { from: mainStyleDest, to: mainStyleDest, map: false });
      fs.writeFileSync(mainStyleDest, result.css);
      console.log(`Processed style.css -> ${mainStyleDest}`);
    } catch (err) {
      console.error('Error processing style.css:', err);
    }
  } else {
    console.warn(`Warning: Compiled style.css not found at ${mainStyleDest}`);
  }

  // 2. Process page-specific files from src/css/pages/ to _site/css/pages/
  const srcPagesDir = path.join(srcDir, 'css/pages');
  const destPagesDir = path.join(destDir, 'css/pages');

  if (fs.existsSync(srcPagesDir)) {
    fs.mkdirSync(destPagesDir, { recursive: true });
    const pageFiles = fs.readdirSync(srcPagesDir).filter(file => file.endsWith('.css'));
    
    for (const file of pageFiles) {
      const srcPath = path.join(srcPagesDir, file);
      const destPath = path.join(destPagesDir, file);
      const cssContent = fs.readFileSync(srcPath, 'utf8');
      
      try {
        const result = await processor.process(cssContent, { from: srcPath, to: destPath, map: false });
        fs.writeFileSync(destPath, result.css);
        console.log(`Compiled page CSS: ${file} -> ${destPath}`);
      } catch (err) {
        console.error(`Error processing page CSS ${file}:`, err);
      }
    }
  }
}

if (require.main === module) {
  bundleMainCss();
}

module.exports = {
  bundleMainCss,
  postprocessCss
};

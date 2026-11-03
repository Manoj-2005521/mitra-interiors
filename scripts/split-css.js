const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const cssDir = path.join(srcDir, 'css');
const styleCssPath = path.join(srcDir, 'style.css');

if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

const styleCss = fs.readFileSync(styleCssPath, 'utf8');

// Define indices to split style.css
// 1. Tokens: start to Header & Sticky Nav
// 2. Header: Header & Sticky Nav to Hero Slider
// 3. Hero: Hero Slider to Trust Strip Section
// 4. Components Part 1: Trust Strip Section to Footer Section
// 5. Footer: Footer Section to Scroll Reveal Animation System
// 6. Animations: Scroll Reveal Animation System to Additional Premium Enhancements
// 7. Components Part 2: Additional Premium Enhancements to end

const headerNavStr = '/* ==========================================================================\n   Header & Sticky Nav';
const heroSliderStr = '/* ==========================================================================\n   Hero Slider';
const trustStripStr = '/* ==========================================================================\n   Trust Strip Section';
const footerStr = '/* ==========================================================================\n   Footer Section';
const scrollRevealStr = '/* ==========================================================================\n   Scroll Reveal';
const addEnhancementsStr = '/* ==========================================================================\n   Additional Premium Enhancements';

// Find indexes using normalized newlines
const content = styleCss.replace(/\r\n/g, '\n');

const headerIndex = content.indexOf(headerNavStr.replace(/\r\n/g, '\n'));
const heroIndex = content.indexOf(heroSliderStr.replace(/\r\n/g, '\n'));
const trustIndex = content.indexOf(trustStripStr.replace(/\r\n/g, '\n'));
const footerIndex = content.indexOf(footerStr.replace(/\r\n/g, '\n'));
const scrollRevealIndex = content.indexOf(scrollRevealStr.replace(/\r\n/g, '\n'));
const addEnhancementsIndex = content.indexOf(addEnhancementsStr.replace(/\r\n/g, '\n'));

if (
  headerIndex === -1 ||
  heroIndex === -1 ||
  trustIndex === -1 ||
  footerIndex === -1 ||
  scrollRevealIndex === -1 ||
  addEnhancementsIndex === -1
) {
  console.error('Failed to locate all split points in style.css.');
  console.log({
    headerIndex,
    heroIndex,
    trustIndex,
    footerIndex,
    scrollRevealIndex,
    addEnhancementsIndex
  });
  process.exit(1);
}

const tokensCss = content.substring(0, headerIndex);
const headerCss = content.substring(headerIndex, heroIndex);
const heroCss = content.substring(heroIndex, trustIndex);
const componentsPart1 = content.substring(trustIndex, footerIndex);
const footerCss = content.substring(footerIndex, scrollRevealIndex);
const animationsCss = content.substring(scrollRevealIndex, addEnhancementsIndex);
const componentsPart2 = content.substring(addEnhancementsIndex);

const componentsCss = componentsPart1 + '\n\n' + componentsPart2;

fs.writeFileSync(path.join(cssDir, 'tokens.css'), tokensCss.trim() + '\n');
fs.writeFileSync(path.join(cssDir, 'header.css'), headerCss.trim() + '\n');
fs.writeFileSync(path.join(cssDir, 'hero.css'), heroCss.trim() + '\n');
fs.writeFileSync(path.join(cssDir, 'components.css'), componentsCss.trim() + '\n');
fs.writeFileSync(path.join(cssDir, 'footer.css'), footerCss.trim() + '\n');
fs.writeFileSync(path.join(cssDir, 'animations.css'), animationsCss.trim() + '\n');

console.log('CSS files split successfully into src/css/ directory!');

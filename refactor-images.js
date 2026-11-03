const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findNjkFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findNjkFiles(filePath, fileList);
    } else if (filePath.endsWith('.njk')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const njkFiles = findNjkFiles(directoryPath);

const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;

njkFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(imgRegex, (match, before, src, after) => {
    const altMatch = (before + after).match(/alt=["']([^"']*)["']/i);
    let alt = altMatch ? altMatch[1] : "";

    const classMatch = (before + after).match(/class=["']([^"']*)["']/i);
    let classes = classMatch ? classMatch[1] : "";

    const loadingMatch = (before + after).match(/loading=["']([^"']*)["']/i);
    let loading = loadingMatch ? loadingMatch[1] : "lazy";
    let fetchpriority = loading === "eager" ? "high" : "auto";
    
    // Ignore dynamic variables in src
    if (src.includes('{{') || src.includes('${')) {
      return match;
    }

    return `{% image "${src}", "${alt}", "100vw", "${classes}", "${fetchpriority}" %}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored images in ${file}`);
  }
});
console.log('Done refactoring images.');

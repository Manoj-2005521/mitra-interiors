const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');
const projectsHtml = fs.readFileSync('projects.html', 'utf8');

// Extract services from app.js
const servicesMatch = appJs.match(/const services = (\[[\s\S]*?\]);\s*const svcListContainer/);
if (servicesMatch) {
  const servicesData = eval(servicesMatch[1]);
  fs.writeFileSync('src/_data/services.json', JSON.stringify(servicesData, null, 2));
}

// Extract projects from app.js
const projectsMatch = appJs.match(/const projects = (\[[\s\S]*?\]);\s*const masonryGrid/);
if (projectsMatch) {
  const projectsData = eval(projectsMatch[1]);
  fs.writeFileSync('src/_data/projects.json', JSON.stringify(projectsData, null, 2));
}

// Extract portfolioProjects from projects.html
const portfolioMatch = projectsHtml.match(/const portfolioProjects = (\[[\s\S]*?\]);\s*const pGrid/);
if (portfolioMatch) {
  const portfolioData = eval(portfolioMatch[1]);
  fs.writeFileSync('src/_data/portfolio.json', JSON.stringify(portfolioData, null, 2));
}

// Extract FAQ from app.js
const faqMatch = appJs.match(/const faqData = (\[[\s\S]*?\]);\s*const faqListContainer/);
if (faqMatch) {
  const faqData = eval(faqMatch[1]);
  fs.writeFileSync('src/_data/faqs.json', JSON.stringify(faqData, null, 2));
}
console.log('Data extracted successfully.');

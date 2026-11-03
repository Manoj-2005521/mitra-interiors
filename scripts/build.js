#!/usr/bin/env node
process.env.NODE_ENV = 'production';
const { execSync } = require('child_process');

try {
  console.log('Starting MITRA production build...');
  execSync('npx @11ty/eleventy', { stdio: 'inherit' });
  console.log('MITRA production build completed successfully!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

// Simple build script to create minified version
function minifyJS(code) {
  // Basic minification - remove comments and extra whitespace
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/;\s*}/g, ';}') // Remove space before closing brace
    .replace(/{\s*/g, '{') // Remove space after opening brace
    .replace(/}\s*/g, '}') // Remove space after closing brace
    .trim();
}

// Read source file
const srcPath = path.join(__dirname, 'src', 'immersive-bilingual.js');
const distPath = path.join(__dirname, 'dist', 'immersive-bilingual.min.js');

// Ensure dist directory exists
if (!fs.existsSync(path.dirname(distPath))) {
  fs.mkdirSync(path.dirname(distPath), { recursive: true });
}

// Read and process source
const sourceCode = fs.readFileSync(srcPath, 'utf8');

// Create UMD wrapper
const umdWrapper = `
/**
 * Immersive Bilingual Toggle Library - v1.0.0
 * A universal JavaScript library for bilingual text toggling
 * @license MIT
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.ImmersiveBilingual = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  ${sourceCode}
  return ImmersiveBilingual;
}));
`;

// Write minified version
fs.writeFileSync(distPath, umdWrapper);

console.log('✅ Build completed successfully!');
console.log(`📦 Output: ${distPath}`);
console.log(`📊 Size: ${Math.round(fs.statSync(distPath).size / 1024 * 100) / 100} KB`);
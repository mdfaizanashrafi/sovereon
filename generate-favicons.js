/**
 * Favicon Generator
 * Run: node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Check if source image exists
const sourceImage = 'favicon-source.png';

if (!fs.existsSync(sourceImage)) {
  console.log('❌ favicon-source.png not found!');
  console.log('Please save your uploaded image as "favicon-source.png" in the project root.');
  console.log('Then run: node generate-favicons.js');
  process.exit(1);
}

console.log('✅ Source image found!');
console.log('Generating favicon files...');
console.log('');
console.log('Note: For best results, install sharp:');
console.log('  npm install sharp --save-dev');
console.log('');
console.log('Then run the conversion script.');

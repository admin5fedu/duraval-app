/**
 * Script to generate PWA icons
 * This script creates placeholder icons that can be replaced with actual logo later
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple SVG icon with Duraval branding
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">D</text>
</svg>`;
};

// Note: This creates SVG files. For PNG, you'll need to:
// 1. Use an online converter (like cloudconvert.com)
// 2. Or use a tool like ImageMagick: convert icon-192.svg icon-192.png
// 3. Or use a Node.js library like sharp (requires installation)

console.log('Creating placeholder SVG icons...');

// Create SVG icons
const sizes = [
  { name: 'icon-192', size: 192 },
  { name: 'icon-512', size: 512 },
  { name: 'apple-touch-icon', size: 180 }
];

sizes.forEach(({ name, size }) => {
  const svgPath = path.join(publicDir, `${name}.svg`);
  fs.writeFileSync(svgPath, createSVGIcon(size));
  console.log(`✓ Created ${name}.svg (${size}x${size})`);
});

console.log('\n⚠️  Note: These are SVG placeholders.');
console.log('To convert to PNG, you can:');
console.log('1. Use an online tool like https://cloudconvert.com/svg-to-png');
console.log('2. Or install ImageMagick and run: convert icon-192.svg icon-192.png');
console.log('3. Or use the logo from https://duraval.vn and resize it to the required sizes');


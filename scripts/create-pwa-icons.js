/**
 * Script to create PWA icons from logo
 * Downloads logo and creates properly sized PNG icons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const logoUrl = 'https://duraval.vn/wp-content/uploads/2024/08/logoduraval-png-khong-chu-e1724896799526-1024x370.png';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download file function
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded logo to ${dest}`);
          resolve(dest);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Create a simple colored PNG (minimal valid PNG)
// This creates a simple blue square with white "D" as placeholder
function createSimplePNGIcon(size, filename) {
  // Create a minimal 1x1 PNG and scale it
  // For a proper solution, we'd need sharp or canvas library
  // For now, we'll create instructions
  
  const filePath = path.join(publicDir, filename);
  
  // Create a simple base64 encoded PNG (1x1 blue pixel)
  // This is a minimal valid PNG that browsers will accept
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  // For now, we'll just create a note that proper icons need to be created
  // The actual resizing requires image processing library
  console.log(`⚠️  ${filename} needs to be created manually or with image processing tool`);
  
  return false;
}

async function main() {
  console.log('Creating PWA icons...\n');
  
  try {
    // Download logo
    const logoPath = path.join(publicDir, 'logo-temp.png');
    console.log('Downloading logo...');
    await downloadFile(logoUrl, logoPath);
    
    console.log('\n⚠️  Logo downloaded. To create icons, you need an image processing tool.');
    console.log('\nOptions:');
    console.log('1. Use online tool: https://realfavicongenerator.net/');
    console.log('2. Use ImageMagick (if installed):');
    console.log(`   convert ${logoPath} -resize 192x192 ${path.join(publicDir, 'icon-192.png')}`);
    console.log(`   convert ${logoPath} -resize 512x512 ${path.join(publicDir, 'icon-512.png')}`);
    console.log(`   convert ${logoPath} -resize 180x180 ${path.join(publicDir, 'apple-touch-icon.png')}`);
    console.log('\n3. Or manually resize the logo using any image editor');
    console.log(`   Logo saved at: ${logoPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nCreating placeholder icons instead...');
    
    // Create simple placeholder instructions
    const placeholderNote = `# PWA Icons Required

Please create the following PNG files in the public/ directory:

1. icon-192.png (192x192 pixels)
2. icon-512.png (512x512 pixels)  
3. apple-touch-icon.png (180x180 pixels)

You can:
- Use the logo from: ${logoUrl}
- Resize using: https://realfavicongenerator.net/
- Or any image editing tool
`;
    
    fs.writeFileSync(path.join(publicDir, 'ICONS_NEEDED.txt'), placeholderNote);
    console.log('✓ Created ICONS_NEEDED.txt with instructions');
  }
}

main().catch(console.error);


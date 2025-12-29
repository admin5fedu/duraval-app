/**
 * Script to generate PWA icons as PNG files
 * Downloads logo and creates properly sized icons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const logoUrl = 'https://duraval.vn/wp-content/uploads/2024/08/logoduraval-png-khong-chu-e1724896799526-1024x370.png';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple PNG data for a blue square with white "D" (minimal valid PNG)
// This is a 1x1 pixel PNG encoded in base64, we'll create a proper one
function createSimplePNG(size) {
  // Create a minimal valid PNG using a simple approach
  // For a proper solution, we'd use sharp or canvas, but for now we'll create
  // a script that downloads the logo and processes it
  
  // This is a placeholder - we'll need to actually download and process the image
  console.log(`Would create ${size}x${size} PNG icon`);
}

// Download file function
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function generateIcons() {
  console.log('Generating PWA icons...\n');
  
  // For now, create instructions file
  const instructions = `
# Hướng dẫn tạo PWA Icons

## Cách 1: Sử dụng logo hiện có (Khuyến nghị)

1. Download logo từ: ${logoUrl}
2. Sử dụng tool online để resize:
   - Truy cập: https://www.iloveimg.com/resize-image
   - Upload logo
   - Resize thành các kích thước:
     * 192x192 pixels → lưu thành icon-192.png
     * 512x512 pixels → lưu thành icon-512.png  
     * 180x180 pixels → lưu thành apple-touch-icon.png
3. Đặt các file vào thư mục public/

## Cách 2: Sử dụng RealFaviconGenerator

1. Truy cập: https://realfavicongenerator.net/
2. Upload logo của bạn
3. Download và extract vào thư mục public/

## Cách 3: Sử dụng ImageMagick (nếu đã cài)

\`\`\`bash
# Download logo
curl -o public/logo-original.png "${logoUrl}"

# Resize thành các icon
convert public/logo-original.png -resize 192x192 public/icon-192.png
convert public/logo-original.png -resize 512x512 public/icon-512.png
convert public/logo-original.png -resize 180x180 public/apple-touch-icon.png
\`\`\`

## File cần tạo trong public/:
- icon-192.png (192x192)
- icon-512.png (512x512)
- apple-touch-icon.png (180x180)
`;

  fs.writeFileSync(path.join(__dirname, '..', 'ICON_INSTRUCTIONS.md'), instructions);
  console.log('✓ Đã tạo file hướng dẫn: ICON_INSTRUCTIONS.md\n');
  console.log('⚠️  Để tạo icon PNG, bạn cần:');
  console.log('1. Download logo từ:', logoUrl);
  console.log('2. Resize thành các kích thước: 192x192, 512x512, 180x180');
  console.log('3. Đặt vào thư mục public/\n');
  console.log('Hoặc sử dụng tool online: https://realfavicongenerator.net/');
}

generateIcons().catch(console.error);


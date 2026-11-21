import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userUploadedPath = 'C:/Users/MD. Nayem Hossain/.gemini/antigravity/brain/f04d7e51-b7c3-4444-8e99-5e46f90480b3/.user_uploaded/media_1795072733373_ba5429cd.png';
const appDir = path.resolve(__dirname, '..');

function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // Count

  let offset = 6 + count * 16;
  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buf.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function run() {
  console.log('Using source image:', userUploadedPath);
  if (!fs.existsSync(userUploadedPath)) {
    throw new Error('User uploaded file not found: ' + userUploadedPath);
  }

  // Backup source file into public/
  const publicSourcePath = path.join(appDir, 'public', 'favicon-source.png');
  fs.copyFileSync(userUploadedPath, publicSourcePath);

  // 1. Trim outer transparent space to get the exact logo bounds
  const trimmed = await sharp(userUploadedPath)
    .trim()
    .toBuffer({ resolveWithObject: true });

  console.log('Trimmed logo dimensions:', trimmed.info.width, 'x', trimmed.info.height);

  // 2. Scale up the logo to fill 500x500 within a 512x512 transparent canvas
  // This makes the logo much larger, bold, and ultra-crisp for 4K / retina displays
  const targetLogoDimension = 502;
  const resizedLogo = await sharp(trimmed.data)
    .resize(targetLogoDimension, targetLogoDimension, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: 'lanczos3'
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });

  // Center on a 512x512 transparent canvas
  const padLeft = Math.round((512 - resizedLogo.info.width) / 2);
  const padTop = Math.round((512 - resizedLogo.info.height) / 2);

  const icon512Buf = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: resizedLogo.data, left: padLeft, top: padTop }
    ])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  console.log('Generated 512x512 ultra-crisp icon:', icon512Buf.length, 'bytes');

  // 3. 192x192 icon for mobile and high-DPI displays
  const icon192Buf = await sharp(icon512Buf)
    .resize(192, 192, { kernel: 'lanczos3' })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // 4. 180x180 Apple Touch Icon
  const appleBuf = await sharp(icon512Buf)
    .resize(180, 180, { kernel: 'lanczos3' })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // 5. Multi-size ICO for browser tabs (16, 32, 48, 64, 128, 256)
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    icoSizes.map(size =>
      sharp(icon512Buf)
        .resize(size, size, { kernel: 'lanczos3' })
        .png({ quality: 100 })
        .toBuffer()
    )
  );
  const icoBuf = createIco(pngBuffers, icoSizes);

  // 6. SVG embedding high-res PNG for vector icon endpoints
  const b64 = icon512Buf.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,${b64}" />
</svg>`;

  // 7. Write to app/ and public/
  const destinations = [
    { dir: path.join(appDir, 'app'), writeIco: true },
    { dir: path.join(appDir, 'public'), writeIco: true },
  ];

  for (const { dir, writeIco } of destinations) {
    fs.writeFileSync(path.join(dir, 'icon.png'), icon512Buf);
    fs.writeFileSync(path.join(dir, 'apple-icon.png'), appleBuf);
    fs.writeFileSync(path.join(dir, 'icon.svg'), svgContent);
    if (writeIco) {
      fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuf);
    }
    console.log(`Updated icons in ${dir}`);
  }

  // Also write dedicated icon-192 and icon-512 to public/
  fs.writeFileSync(path.join(appDir, 'public', 'icon-192.png'), icon192Buf);
  fs.writeFileSync(path.join(appDir, 'public', 'icon-512.png'), icon512Buf);

  console.log('✓ Successfully generated all high-resolution 4K favicons!');
}

run().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});

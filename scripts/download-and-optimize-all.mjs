import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../lib/prisma.js';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function optimizeAll() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const allUrls = new Set();

  // 1. Settings (logo & banners)
  const settings = await prisma.setting.findMany();
  for (const s of settings) {
    try {
      const data = JSON.parse(s.value);
      if (data.logo) allUrls.add(data.logo);
      if (Array.isArray(data.banners)) {
        data.banners.forEach((b) => b && allUrls.add(b));
      }
    } catch {}
  }

  // 2. Categories
  const categories = await prisma.category.findMany({ select: { imageUrl: true } });
  categories.forEach((c) => c.imageUrl && allUrls.add(c.imageUrl));

  // 3. Products
  const products = await prisma.product.findMany({ select: { imageUrl: true, galleryImages: true } });
  products.forEach((p) => {
    if (p.imageUrl) allUrls.add(p.imageUrl);
    if (Array.isArray(p.galleryImages)) {
      p.galleryImages.forEach((img) => img && allUrls.add(img));
    }
  });

  console.log(`Found ${allUrls.size} unique image paths to optimize...`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const urlPath of allUrls) {
    if (!urlPath.startsWith('/uploads/')) continue;
    const fileName = path.basename(urlPath);
    const destPath = path.join(UPLOADS_DIR, fileName);

    console.log(`Processing: ${fileName}`);
    try {
      let rawBuffer = null;
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
        rawBuffer = fs.readFileSync(destPath);
      } else {
        const liveUrl = `https://smartagrosource.com/uploads/${encodeURIComponent(fileName)}`;
        const res = await fetch(liveUrl);
        if (res.ok) {
          rawBuffer = Buffer.from(await res.arrayBuffer());
        }
      }

      if (!rawBuffer || rawBuffer.length === 0) {
        console.warn(`  Could not fetch ${fileName}`);
        continue;
      }

      const origSize = rawBuffer.length;
      totalOriginal += origSize;

      const ext = path.extname(fileName).toLowerCase();
      let pipeline = sharp(rawBuffer);
      const metadata = await pipeline.metadata();

      // Resize if too large
      if (metadata.width > 1200 || metadata.height > 1200) {
        pipeline = pipeline.resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      let optimizedBuffer;
      if (ext === '.png') {
        // High-effort palette compression for PNG to retain transparency while shrinking size dramatically
        optimizedBuffer = await pipeline
          .png({
            compressionLevel: 9,
            quality: 82,
            palette: true,
            effort: 8,
          })
          .toBuffer();
      } else if (ext === '.jpg' || ext === '.jpeg') {
        optimizedBuffer = await pipeline
          .jpeg({
            quality: 82,
            mozjpeg: true,
          })
          .toBuffer();
      } else if (ext === '.webp') {
        optimizedBuffer = await pipeline
          .webp({
            quality: 82,
            effort: 5,
          })
          .toBuffer();
      } else {
        optimizedBuffer = rawBuffer;
      }

      fs.writeFileSync(destPath, optimizedBuffer);
      const optSize = optimizedBuffer.length;
      totalOptimized += optSize;

      const percent = Math.round((1 - optSize / origSize) * 100);
      console.log(`  ✓ ${(origSize / 1024).toFixed(1)} KB -> ${(optSize / 1024).toFixed(1)} KB (${percent}% saved)`);
    } catch (err) {
      console.error(`  Error processing ${fileName}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total original: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total optimized: ${(totalOptimized / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Bandwidth saved: ${Math.round((1 - totalOptimized / totalOriginal) * 100)}%`);
  console.log(`========================================\n`);

  process.exit(0);
}

optimizeAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

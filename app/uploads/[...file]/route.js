import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const fileParts = resolvedParams?.file || [];
  const relativePath = Array.isArray(fileParts) ? fileParts.join('/') : String(fileParts);

  const localDiskPath = path.join(process.cwd(), 'public', 'uploads', relativePath);

  // 1. If file already exists locally, serve with long-term cache
  // Check if client accepts modern WebP and a WebP sibling exists
  const acceptHeader = request.headers.get('accept') || '';
  const ext = path.extname(localDiskPath).toLowerCase();
  const webpDiskPath = localDiskPath.replace(/\.(png|jpe?g)$/i, '.webp');

  if (acceptHeader.includes('image/webp') && fs.existsSync(webpDiskPath)) {
    try {
      const webpBuffer = fs.readFileSync(webpDiskPath);
      return new NextResponse(webpBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Vary': 'Accept',
        },
      });
    } catch {}
  }

  if (fs.existsSync(localDiskPath)) {
    try {
      const stats = fs.statSync(localDiskPath);
      if (stats.isFile()) {
        const fileBuffer = fs.readFileSync(localDiskPath);
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept',
          },
        });
      }
    } catch {}
  }

  // 2. Fallback: Fetch from live website, optimize with Sharp, and save locally
  const liveUrl = `https://smartagrosource.com/uploads/${relativePath}`;
  try {
    const res = await fetch(liveUrl, { cache: 'no-store' });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);
      const ext = path.extname(relativePath).toLowerCase();

      let optimizedBuffer = rawBuffer;
      let contentType = res.headers.get('content-type') || 'application/octet-stream';

      // Optimize large images on the fly with Sharp
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && rawBuffer.length > 100 * 1024) {
        try {
          optimizedBuffer = await sharp(rawBuffer)
            .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
          contentType = 'image/webp';
        } catch {
          optimizedBuffer = rawBuffer;
        }
      }

      // Save to local public/uploads for instant 0ms access in future requests
      try {
        fs.mkdirSync(path.dirname(localDiskPath), { recursive: true });
        fs.writeFileSync(localDiskPath, optimizedBuffer);
      } catch {}

      return new NextResponse(optimizedBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch {}

  // 3. Fallback redirect if fetch failed
  return NextResponse.redirect(liveUrl, 307);
}

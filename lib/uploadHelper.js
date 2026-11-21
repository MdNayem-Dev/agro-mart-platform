import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * Saves an uploaded file buffer to public/uploads directory with automatic Sharp optimization
 * @param {File|Blob|Buffer} file - Uploaded file or buffer
 * @param {string} [originalName] - Optional original filename
 * @returns {Promise<string>} Relative URL (e.g., /uploads/image_12345.webp)
 */
export async function saveUploadedFile(file, originalName) {
  if (!file) throw new Error('No file provided');

  let buffer;
  let filename = originalName || 'upload.jpg';

  if (typeof file.arrayBuffer === 'function') {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    if (file.name) filename = file.name;
  } else if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    throw new Error('Unsupported file format');
  }

  // Target directory: smart-agro-app/public/uploads
  let baseDir = process.cwd();
  const subCandidate = path.join(baseDir, 'smart Agro Source', 'smart-agro-app');
  try {
    const stat = await fs.stat(subCandidate);
    if (stat.isDirectory()) {
      baseDir = subCandidate;
    }
  } catch {}

  const uploadDir = path.join(baseDir, 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(filename).toLowerCase() || '.jpg';
  const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');

  let finalBuffer = buffer;
  let finalExt = ext;

  // Server-side Sharp optimization: compress to lightweight WebP
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    try {
      finalBuffer = await sharp(buffer)
        .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      finalExt = '.webp';
    } catch (err) {
      console.warn('Sharp server-side optimization skipped, keeping original:', err.message);
      finalBuffer = buffer;
      finalExt = ext;
    }
  }

  const uniqueName = `${baseName}_${Date.now()}${finalExt}`;
  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, finalBuffer);

  return `/uploads/${uniqueName}`;
}

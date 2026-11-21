import { NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/uploadHelper';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const url = await saveUploadedFile(file);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('API upload route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}

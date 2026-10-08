import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseStorage, STORAGE_BUCKET, SIGNED_TTL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Please use a JPG, PNG, WebP or GIF image.' },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image is over 8MB — please use a smaller one.' },
        { status: 400 }
      );
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-');
    const storagePath = `${new Date().getFullYear()}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let finalUrl = null;

    try {
      const { error: uploadError } = await supabaseStorage.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        });

      if (!uploadError) {
        const { data: signData } = await supabaseStorage.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(storagePath, SIGNED_TTL);

        if (signData?.signedUrl) {
          finalUrl = signData.signedUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase storage upload error:', e?.message);
    }

    if (!finalUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        const localFilename = `${Date.now()}-${safeName}`;
        const filePath = path.join(uploadsDir, localFilename);
        await fs.promises.writeFile(filePath, buffer);
        finalUrl = `/uploads/${localFilename}`;
      } catch (localErr) {
        console.error('Local fallback error:', localErr);
      }
    }

    if (!finalUrl) {
      return NextResponse.json({ success: false, error: 'Failed to save uploaded image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      name: safeName,
    });
  } catch (err) {
    console.error('GTC API Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

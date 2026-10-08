import { NextResponse } from 'next/server';
import { supabaseStorage, STORAGE_BUCKET, SIGNED_TTL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const years = [String(currentYear), String(currentYear - 1)];
    const images = [];

    for (const year of years) {
      const { data: list, error: listError } = await supabaseStorage.storage
        .from(STORAGE_BUCKET)
        .list(year, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError || !list) continue;

      for (const item of list) {
        if (!item.name || item.name.startsWith('.')) continue;

        const path = `${year}/${item.name}`;
        const { data: sig } = await supabaseStorage.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(path, SIGNED_TTL);

        if (sig?.signedUrl) {
          images.push({
            name: item.name,
            path,
            url: sig.signedUrl,
            created_at: item.created_at,
          });
        }
      }
    }

    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      const uploadsDir = pathModule.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = await fs.promises.readdir(uploadsDir);
        for (const f of files) {
          if (!f.startsWith('.')) {
            const stat = await fs.promises.stat(pathModule.join(uploadsDir, f));
            images.push({
              name: f,
              path: `/uploads/${f}`,
              url: `/uploads/${f}`,
              created_at: stat.birthtime?.toISOString() || new Date().toISOString(),
            });
          }
        }
      }
    } catch (localErr) {
      console.warn('Local uploads read error:', localErr?.message);
    }

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error('GTC API Media error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || searchParams.get('path');
    if (!name) {
      return NextResponse.json({ success: false, error: 'Image name is required' }, { status: 400 });
    }

    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      const cleanName = pathModule.basename(name);
      const localPath = pathModule.join(process.cwd(), 'public', 'uploads', cleanName);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    } catch (e) {}

    try {
      await supabaseStorage.storage.from(STORAGE_BUCKET).remove([name]);
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

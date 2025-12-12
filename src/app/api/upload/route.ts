import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customSlug = formData.get('slug') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.md')) {
      return NextResponse.json(
        { success: false, error: 'Only .md files are allowed' },
        { status: 400 }
      );
    }

    const markdownFile = await uploadFile(file, customSlug || undefined);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const publicUrl = `${baseUrl}/${markdownFile.slug}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      slug: markdownFile.slug,
      filename: markdownFile.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}


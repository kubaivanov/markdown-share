import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, validateAdminKey } from '@/lib/auth';
import { getFileBySlug, deleteFile, getFileContent } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  
  try {
    const file = await getFileBySlug(slug);
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if raw content is requested
    const url = new URL(request.url);
    const raw = url.searchParams.get('raw') === 'true';

    if (raw) {
      const content = await getFileContent(file.blobUrl);
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${file.filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  
  // Check for Admin key (from UI) or API key (from script)
  const adminKey = request.headers.get('x-admin-key');
  const isAdminAuth = adminKey && validateAdminKey(adminKey);
  const isApiAuth = validateApiKey(request);

  if (!isAdminAuth && !isApiAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const success = await deleteFile(slug);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

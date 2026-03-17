import { NextRequest, NextResponse } from 'next/server';
import { getFileBySlug, getFileContent } from '@/lib/storage';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  
  try {
    const file = await getFileBySlug(slug);

    if (!file || file.type !== 'html') {
      return new NextResponse('Not found or not an HTML file', { status: 404 });
    }

    const content = await getFileContent(file.blobUrl);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

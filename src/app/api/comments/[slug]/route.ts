import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/auth';
import { getComments, addComment, deleteComment, getFileBySlug } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const file = await getFileBySlug(slug);

    if (!file || file.type === 'html') {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    if (!file.commentsEnabled) {
      return NextResponse.json(
        { success: false, error: 'Comments are disabled' },
        { status: 403 }
      );
    }

    const comments = await getComments(slug);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const file = await getFileBySlug(slug);

    if (!file || file.type === 'html') {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    if (!file.commentsEnabled) {
      return NextResponse.json(
        { success: false, error: 'Comments are disabled' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { author, text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const comment = await addComment(slug, author || '', text);
    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const adminKey = request.headers.get('x-admin-key');
  if (!adminKey || !validateAdminKey(adminKey)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const commentId = url.searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteComment(slug, commentId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

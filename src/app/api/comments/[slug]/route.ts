import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment, deleteComment, editComment, toggleCommentDone, getFileBySlug } from '@/lib/storage';

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
    const { author, text, selection } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const comment = await addComment(slug, author || '', text, selection);
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { id, action, text } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    if (action === 'edit') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return NextResponse.json(
          { success: false, error: 'Text is required' },
          { status: 400 }
        );
      }

      const comment = await editComment(slug, id, text);

      if (!comment) {
        return NextResponse.json(
          { success: false, error: 'Comment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, comment });
    }

    if (action === 'done') {
      const comment = await toggleCommentDone(slug, id);

      if (!comment) {
        return NextResponse.json(
          { success: false, error: 'Comment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, comment });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Patch comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

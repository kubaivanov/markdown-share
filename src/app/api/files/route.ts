import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/auth';
import { getAllFiles } from '@/lib/storage';

export async function GET(request: NextRequest) {
  // Validate Admin key for listing files (from header)
  const adminKey = request.headers.get('x-admin-key');
  
  if (!adminKey || !validateAdminKey(adminKey)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const files = await getAllFiles();
    
    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/auth';
import { getSettings, updateSettings } from '@/lib/storage';
import { ThemeName } from '@/types';

const validThemes: ThemeName[] = ['orange', 'blue', 'green', 'purple', 'gray'];

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');

  if (!adminKey || !validateAdminKey(adminKey)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { theme } = body;

    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme' },
        { status: 400 }
      );
    }

    const settings = await updateSettings({ theme });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

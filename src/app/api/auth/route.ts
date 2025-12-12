import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;

    if (!adminKey) {
      return NextResponse.json(
        { success: false, error: 'Admin klíč je povinný' },
        { status: 400 }
      );
    }

    if (!validateAdminKey(adminKey)) {
      return NextResponse.json(
        { success: false, error: 'Nesprávný admin klíč' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Přihlášení úspěšné',
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při ověřování' },
      { status: 500 }
    );
  }
}









import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/app/actions/settings';

export async function GET() {
  try {
    const { Public } = await getAdminSettings();
    const list = (Public as any)?.CMS?.Categories ?? [];
    return NextResponse.json({ Records: list });
  } catch (e) {
    return NextResponse.json({ Records: [] }, { status: 200 });
  }
}


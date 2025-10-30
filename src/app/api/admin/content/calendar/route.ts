import { NextResponse } from 'next/server';
import { getCalendarEvents } from '@/app/actions/content';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ym = searchParams.get('ym') || new Date().toISOString().slice(0, 7);
    const typeParam = (searchParams.get('type') || 'all') as
      | 'publish'
      | 'announcement'
      | 'all';
    const events = await getCalendarEvents({ ym, type: typeParam });
    return NextResponse.json(events, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to load calendar events' },
      { status: 500 }
    );
  }
}


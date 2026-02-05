import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/app/actions/settings';

export async function GET() {
	try {
		// TODO: Replace with call to Channels api
		const { Public } = await getAdminSettings();
		const list = (Public as any)?.CMS?.Channels ?? [];
		return NextResponse.json({ Records: list });
	} catch (e) {
		return NextResponse.json({ Records: [] }, { status: 200 });
	}
}

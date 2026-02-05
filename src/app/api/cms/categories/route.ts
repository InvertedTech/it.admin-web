import { NextResponse } from 'next/server';
import { getAdminSettings, getPublicSettings } from '@/app/actions/settings';
import { getSession } from '@/lib/session';
import { isAdminOrHigher } from '@/lib/roleHelpers';

export async function GET() {
	try {
		const session = await getSession();
		const roles = session.roles ?? [];
		const { Public } = isAdminOrHigher(roles)
			? await getAdminSettings()
			: await getPublicSettings();
		const list = (Public as any)?.CMS?.Categories ?? [];
		return NextResponse.json({ Records: list });
	} catch (e) {
		return NextResponse.json({ Records: [] }, { status: 200 });
	}
}

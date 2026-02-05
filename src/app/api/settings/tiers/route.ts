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
		const tiers = (Public as any)?.Subscription?.Tiers ?? [];
		return NextResponse.json({ Tiers: tiers });
	} catch (e) {
		return NextResponse.json({ Tiers: [] }, { status: 200 });
	}
}

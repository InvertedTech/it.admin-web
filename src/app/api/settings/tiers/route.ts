import { NextResponse } from 'next/server';
import { getAdminSettings, getPublicSettings } from '@/app/actions/settings';
import { getSessionRoles } from '@/lib/session';
import { isAdminOrHigher } from '@/lib/roleHelpers';

export async function GET() {
	try {
		// TODO(auth-removal): Remove role/authorization read.
		const roles = await getSessionRoles();
		// TODO(auth-removal): Remove role/authorization check.
		const { Public } = isAdminOrHigher(roles)
			? await getAdminSettings()
			: await getPublicSettings();
		const tiers = (Public as any)?.Subscription?.Tiers ?? [];
		return NextResponse.json({ Tiers: tiers });
	} catch (e) {
		return NextResponse.json({ Tiers: [] }, { status: 200 });
	}
}

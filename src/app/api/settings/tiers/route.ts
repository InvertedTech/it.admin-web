import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/app/actions/settings';

export async function GET() {
	try {
		// TODO: Replace with call to tiers api
		const { Public } = await getAdminSettings();
		const tiers = (Public as any)?.Subscription?.Tiers ?? [];
		return NextResponse.json({ Tiers: tiers });
	} catch (e) {
		return NextResponse.json({ Tiers: [] }, { status: 200 });
	}
}

import { NextResponse } from 'next/server';
import { getChannels } from '@/app/actions/settings';

export async function GET() {
	try {
		const channels = await getChannels();
		return NextResponse.json({ Records: channels });
	} catch (e) {
		return NextResponse.json({ Records: [] }, { status: 200 });
	}
}

import { NextRequest, NextResponse } from 'next/server';
import { getAsset } from '@/app/actions/assets';

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const data = await getAsset(id);
		return NextResponse.json(data);
	} catch (e) {
		return NextResponse.json({}, { status: 200 });
	}
}

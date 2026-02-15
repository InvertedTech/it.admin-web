import { NextRequest, NextResponse } from 'next/server';

const baseUrl = process.env.BASE_URL!;

export async function GET(_request: NextRequest) {
	return NextResponse.redirect(new URL('/', baseUrl));
}

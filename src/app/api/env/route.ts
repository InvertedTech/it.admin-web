import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	return NextResponse.json({
		redirect: process.env.IT_LOGIN_REDIRECT ?? 'missing',
		mode: process.env.AUTH_MODE ?? 'missing',
		baseUrl: process.env.BASE_URL ?? 'missing',
		apiBase: process.env.API_BASE_URL ?? 'missing',
	});
}

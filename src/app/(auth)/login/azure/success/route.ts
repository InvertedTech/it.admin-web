import { setToken } from '@/lib/cookies';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = process.env.BASE_URL!;

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get('token');
	if (!token) {
		return NextResponse.json(
			{ error: 'Token is required' },
			{ status: 400 },
		);
	}

	await setToken(token);
	return NextResponse.redirect(new URL('/', baseUrl));
}

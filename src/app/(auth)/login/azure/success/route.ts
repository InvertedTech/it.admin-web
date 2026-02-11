import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get('token')?.trim();

	if (!token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	const session = await getSession();
	session.token = token;
	await session.save();

	return NextResponse.redirect(new URL('/', request.url));
}

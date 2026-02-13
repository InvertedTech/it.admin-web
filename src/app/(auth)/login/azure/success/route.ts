import { getOwnUser } from '@/app/actions/auth';
import { setSession, setTokenCookie } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = process.env.BASE_URL!;

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get('token')?.trim();

	if (!token) {
		console.error('token not found');
		return NextResponse.redirect(new URL('/login', baseUrl));
	}

	await setTokenCookie(token);

	const res = await getOwnUser();
	if (!res || !res.Record) {
		console.error('Res Or Res.Record Was Empty');
		return NextResponse.redirect(new URL('/login', baseUrl));
	}

	const userName = res.Record.Public?.Data?.UserName?.trim();
	const roles = res.Record.Private?.Roles;
	const id = res.Record.Public?.UserID?.trim();

	if (!userName || !roles || roles.length === 0 || !id) {
		console.error('Res Or Res.Record Was Empty');
		return NextResponse.redirect(new URL('/login', baseUrl));
	}

	await setSession({
		userName,
		roles,
		id,
		displayName: res.Record.Public?.Data?.DisplayName,
	});

	return NextResponse.redirect(new URL('/', baseUrl));
}

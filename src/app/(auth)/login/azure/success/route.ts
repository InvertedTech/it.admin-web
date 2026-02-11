import { getOwnUser } from '@/app/actions/auth';
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

	const res = await getOwnUser();
	if (!res || !res.Record) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	const userName = res.Record.Public?.Data?.UserName?.trim();
	const roles = res.Record.Private?.Roles;
	const id = res.Record.Public?.UserID?.trim();

	if (!userName || !roles || roles.length === 0 || !id) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	session.userName = userName;
	session.roles = roles;
	session.id = id;

	if (
		res.Record.Public?.Data?.DisplayName &&
		res.Record.Public.Data.DisplayName !== ''
	) {
		session.displayName = res.Record.Public.Data.DisplayName;
	}

	if (res.Record.Public?.Data?.ProfileImagePNG) {
		session.profileImageId = res.Record.Public.Data.ProfileImagePNG;
	}

	await session.save();

	return NextResponse.redirect(new URL('/', request.url));
}

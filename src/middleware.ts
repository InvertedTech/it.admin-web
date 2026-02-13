import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'it.admin.session';
const TOKEN_COOKIE = 'token';
const PUBLIC_PATHS = ['/login', '/unauthorized'];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isPublicPath = PUBLIC_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if (
		isPublicPath ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname === '/favicon.ico'
	) {
		return NextResponse.next();
	}

	const token = request.cookies.get(TOKEN_COOKIE)?.value;

	if (!token) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = '/login';
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	try {
		const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
		if (!sessionCookie) {
			const loginUrl = request.nextUrl.clone();
			loginUrl.pathname = '/login';
			loginUrl.searchParams.set('from', pathname);
			return NextResponse.redirect(loginUrl);
		}

		const session = JSON.parse(
			decodeURIComponent(sessionCookie),
		) as { roles?: unknown };
		const raw = session?.roles;
		// TODO(auth-removal): Remove role/authorization read.
		const roles = (Array.isArray(raw) ? raw : raw ? [String(raw)] : []).filter(
			(r) => typeof r === 'string' && r.trim().length > 0,
		);
		// TODO(auth-removal): Remove role/authorization gate.
		if (roles.length === 0) {
			const unauthorizedUrl = request.nextUrl.clone();
			unauthorizedUrl.pathname = '/unauthorized';
			return NextResponse.redirect(unauthorizedUrl);
		}
		return NextResponse.next();
	} catch {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = '/login';
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};

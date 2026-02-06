import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';

const AUTH_COOKIE = 'it.admin.session';
const PUBLIC_PATHS = ['/login', '/unauthorized'];
type SessionData = {
	roles?: string[];
};

function getSessionPassword() {
	return (
		process.env.IRON_SESSION_PASSWORD ??
		'dev-only-insecure-please-change-this-at-least-32-chars'
	);
}

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

	const token = request.cookies.get(AUTH_COOKIE)?.value;

	if (!token) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = '/login';
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	try {
		const session = await unsealData<SessionData>(token, {
			password: getSessionPassword(),
		});
		const raw = session?.roles as unknown;
		const roles = (Array.isArray(raw) ? raw : raw ? [String(raw)] : []).filter(
			(r) => typeof r === 'string' && r.trim().length > 0,
		);
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

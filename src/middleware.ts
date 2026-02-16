import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/login-failed', '/logged-out', '/unauthorized'];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
		return NextResponse.next();
	}

	const token = request.cookies.get('token')?.value;
	if (!token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

'server-only';

import { cookies } from 'next/headers';
import { getIronSession, IronSession } from 'iron-session';

const SESSION_COOKIE_NAME = 'it.admin.session';
const TOKEN_COOKIE_NAME = 'token';

export type SessionData = {
	roles?: string[];
	userName?: string;
	displayName?: string;
	id?: string;
	profileImageId?: Uint8Array<ArrayBufferLike>;
};

export async function getSession(): Promise<IronSession<SessionData>> {
	const cookieStore = await cookies();
	return getIronSession(cookieStore, getSessionOptions());
}

export async function getTokenCookie(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
}

export async function setTokenCookie(token: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(TOKEN_COOKIE_NAME, token, {
		...getAuthCookieOptions(),
		httpOnly: true,
	});
}

export async function clearTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(TOKEN_COOKIE_NAME);
}

function getSessionOptions() {
	const pwd = getSessionPassword();
	return {
		cookieName: SESSION_COOKIE_NAME,
		password: pwd,
		cookieOptions: getAuthCookieOptions(),
	} as const;
}

function getSessionPassword() {
	const inProd = process.env.NODE_ENV === 'production';
	const pwd = process.env.IRON_SESSION_PASSWORD;
	if (!pwd && inProd) {
		throw new Error('IRON_SESSION_PASSWORD is not set');
	}

	return pwd ?? 'dev-only-insecure-please-change-this-at-least-32-chars';
}

function getAuthCookieOptions() {
	const inProd = process.env.NODE_ENV === 'production';
	return {
		secure: inProd,
		sameSite: 'lax' as const,
		path: '/',
	};
}

'server-only';

import { cookies } from 'next/headers';
import { getIronSession, IronSession } from 'iron-session';

export type SessionData = {
	token?: string;
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

function getSessionOptions() {
	const inProd = process.env.NODE_ENV === 'production';
	const pwd = process.env.IRON_SESSION_PASSWORD;
	if (!pwd && inProd) {
		throw new Error('IRON_SESSION_PASSWORD is not set');
	}

	return {
		cookieName: 'it.admin.session',
		password:
			pwd ?? 'dev-only-insecure-please-change-this-at-least-32-chars',
		cookieOptions: {
			secure: inProd,
			sameSite: 'lax',
			path: '/',
		},
	} as const;
}

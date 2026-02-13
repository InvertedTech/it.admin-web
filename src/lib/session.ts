'server-only';

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'it.admin.session';
const TOKEN_COOKIE_NAME = 'token';

export type SessionData = {
	roles?: string[];
	userName?: string;
	displayName?: string;
	id?: string;
	profileImageId?: Uint8Array<ArrayBufferLike>;
};

type StoredSessionData = Pick<
	SessionData,
	'roles' | 'userName' | 'displayName' | 'id'
>;

export async function getSession(): Promise<SessionData> {
	const cookieStore = await cookies();
	const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
	return decodeSession(value);
}

export async function setSession(data: SessionData): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, encodeSession(data), {
		...getAuthCookieOptions(),
		httpOnly: true,
	});
}

export async function clearSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, '', {
		...getAuthCookieOptions(),
		httpOnly: true,
		maxAge: 0,
	});
}

export async function getSessionRoles(): Promise<string[]> {
	// TODO(auth-removal): Remove role/authorization read helper.
	const session = await getSession();
	return normalizeRoles(session.roles);
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
	cookieStore.set(TOKEN_COOKIE_NAME, '', {
		...getAuthCookieOptions(),
		httpOnly: true,
		maxAge: 0,
	});
}

function getAuthCookieOptions() {
	const inProd = process.env.NODE_ENV === 'production';
	return {
		secure: inProd,
		sameSite: 'lax' as const,
		path: '/',
	};
}

function normalizeRoles(roles: unknown): string[] {
	return (Array.isArray(roles) ? roles : roles ? [String(roles)] : []).filter(
		(role) => typeof role === 'string' && role.trim().length > 0,
	);
}

function decodeSession(raw: string | undefined): SessionData {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(
			decodeURIComponent(raw),
		) as Partial<StoredSessionData>;
		return {
			roles: normalizeRoles(parsed.roles),
			userName: toTrimmedOrUndefined(parsed.userName),
			displayName: toTrimmedOrUndefined(parsed.displayName),
			id: toTrimmedOrUndefined(parsed.id),
		};
	} catch {
		return {};
	}
}

function encodeSession(data: SessionData): string {
	const stored: StoredSessionData = {
		roles: normalizeRoles(data.roles),
		userName: toTrimmedOrUndefined(data.userName),
		displayName: toTrimmedOrUndefined(data.displayName),
		id: toTrimmedOrUndefined(data.id),
	};
	return encodeURIComponent(JSON.stringify(stored));
}

function toTrimmedOrUndefined(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

import { decodeJwt, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME: string = 'token';

interface CustomClaims extends JWTPayload {
	Id: string;
	Display: string;
	role: string | string[];
}

export type UserSession = {
	id: string;
	userName: string;
	displayName: string;
	roles: string[];
	exp: number;
};

export function decodeToken(token: string): UserSession | null {
	try {
		const claims = decodeJwt<CustomClaims>(token);
		return {
			id: claims.Id,
			userName: claims.sub ?? '',
			displayName: claims.Display,
			roles: splitRoles(claims.role),
			exp: claims.exp ?? 0,
		};
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function getSession(): Promise<UserSession | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
	if (!token || token === '') return null;
	return decodeToken(token);
}

export async function getToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
}

export async function setToken(token: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(TOKEN_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	});
}

export async function clearToken(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(TOKEN_COOKIE_NAME);
}

function splitRoles(roles: unknown): string[] {
	try {
		if (Array.isArray(roles)) return roles;
		if (typeof roles === 'string') {
			if (roles === '') return [];
			if (!roles.includes(',')) return [roles];
			return roles.split(',');
		}
		return [];
	} catch {
		return [];
	}
}

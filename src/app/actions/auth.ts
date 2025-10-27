'use server';

import { create } from '@bufbuild/protobuf';
import {
	AuthenticateUserRequest,
	AuthenticateUserResponseSchema,
	AuthErrorReason,
	AuthErrorSchema,
	GetOtherUserResponse,
	GetOtherUserResponseSchema,
	RenewTokenResponse,
	RenewTokenResponseSchema,
	SearchUsersAdminRequest,
	SearchUsersAdminRequestSchema,
	SearchUsersAdminResponse,
	SearchUsersAdminResponseSchema,
	type AuthenticateUserResponse,
} from '@inverted-tech/fragments/Authentication';
import { cookies } from 'next/headers';
async function getToken() {
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;
	return token;
}

const API_BASE = 'http://localhost:8001/api/auth';
const ADMIN_API_BASE = 'http://localhost:8001/api/auth/admin';

export async function loginAction(
	payload: AuthenticateUserRequest
): Promise<AuthenticateUserResponse> {
	const url =
		process.env.AUTH_LOGIN_URL || 'http://localhost:8001/api/auth/login';

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			cache: 'no-store',
			credentials: 'include',
		});

		if (!res) {
			return create(AuthenticateUserResponseSchema, {
				ok: false,
				Error: create(AuthErrorSchema, {
					Message: 'Unknown Error',
					Type: AuthErrorReason.AUTH_REASON_UNSPECIFIED,
				}),
			});
		}

		const body: AuthenticateUserResponse = await res.json();

		if (body.ok && body.BearerToken && body.BearerToken !== '') {
			const cookieStore = await cookies();
			await cookieStore.set('token', body.BearerToken);
		}

		return body;
	} catch (e: any) {
		return create(AuthenticateUserResponseSchema, {
			ok: false,
			Error: create(AuthErrorSchema, {
				Message: 'Unknown Error',
				Type: AuthErrorReason.AUTH_REASON_UNSPECIFIED,
			}),
		});
	}
}

function toIso(v: unknown): string | undefined {
	if (!v) return;
	if (typeof v === 'string') return v;
	if (v instanceof Date) return v.toISOString();
	if (typeof v === 'object' && v && 'seconds' in (v as any)) {
		const sec = (v as any).seconds as number | bigint | string;
		const s = typeof sec === 'bigint' ? Number(sec) : Number(sec ?? 0);
		const n = Number((v as any).nanos ?? 0);
		const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
		return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
	}
}

export async function listUsers(
	req: SearchUsersAdminRequest = create(SearchUsersAdminRequestSchema, {
		PageSize: 25,
		PageOffset: 0,
		CreatedAfter: undefined,
		CreatedBefore: undefined,
		UserIDs: [],
	})
) {
	console.log(1);
	try {
		const token = await getToken();

		const parts: string[] = [];
		const enc = (k: string, v: string | number | boolean) =>
			`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;

		if (req.PageSize != null) parts.push(enc('PageSize', req.PageSize));
		if (req.PageOffset != null) parts.push(enc('PageOffset', req.PageOffset));
		if (req.SearchString?.trim())
			parts.push(enc('SearchString', req.SearchString.trim()));
		if (Array.isArray(req.Roles))
			for (const r of req.Roles) if (r) parts.push(enc('Roles', r));
		if (Array.isArray(req.UserIDs))
			for (const id of req.UserIDs) if (id) parts.push(enc('UserIDs', id));
		console.log(parts);
		const ca = toIso((req as any)?.CreatedAfter);
		const cb = toIso((req as any)?.CreatedBefore);
		if (ca) parts.push(enc('CreatedAfter', ca));
		if (cb) parts.push(enc('CreatedBefore', cb));

		if (typeof req.IncludeDeleted === 'boolean')
			parts.push(enc('IncludeDeleted', req.IncludeDeleted));

		const base = (ADMIN_API_BASE ?? '').replace(/\/+$/, '');
		const qs = parts.join('&');
		const url = `${base}/search${qs ? `?${qs}` : ''}`;

		console.log('listUsers url:', url);

		const res = await fetch(url, {
			method: 'GET',
			headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
			cache: 'no-store',
		});

		if (!res.ok) return create(SearchUsersAdminResponseSchema);

		const body: SearchUsersAdminResponse = await res.json();
		return body;
	} catch (e) {
		console.error('listUsers error:', e);
		return create(SearchUsersAdminResponseSchema);
	}
}

export async function adminGetUser(userId: string) {
	try {
		const token = await getToken();
		const url = ADMIN_API_BASE.concat(`/user/${userId}`);
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!res) {
			return create(GetOtherUserResponseSchema);
		}

		const body: GetOtherUserResponse = await res.json();
		return body;
	} catch (error) {
		return create(GetOtherUserResponseSchema);
	}
}

export async function renewToken() {
	try {
		const token = await getToken();
		const url = API_BASE.concat('/renewtoken');
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			method: 'GET',
		});

		if (!res) {
			return create(RenewTokenResponseSchema);
		}

		const body: RenewTokenResponse = await res.json();
		if (!body || body.BearerToken === '') {
			return create(RenewTokenResponseSchema);
		}

		const cookieStore = await cookies();
		await cookieStore.set('token', body.BearerToken);
		return body;
	} catch (error) {
		console.error(error);
		return create(RenewTokenResponseSchema);
	}
}

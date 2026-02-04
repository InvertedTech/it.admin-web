'use server';

import { Roles } from '@/lib/types';
import { create, toJsonString } from '@bufbuild/protobuf';
import {
	AuthenticateUserRequest,
	AuthenticateUserResponseSchema,
	AuthErrorReason,
	AuthErrorSchema,
	DisableEnableOtherUserRequest,
	DisableEnableOtherUserRequestSchema,
	DisableEnableOtherUserResponse,
	DisableEnableOtherUserResponseSchema,
	GetOtherUserResponse,
	GetOtherUserResponseSchema,
	ModifyOtherUserRolesRequest,
	ModifyOtherUserRolesRequestSchema,
	ModifyOtherUserRolesResponse,
	ModifyOtherUserRolesResponseSchema,
	RenewTokenResponse,
	RenewTokenResponseSchema,
	SearchUsersAdminRequest,
	SearchUsersAdminRequestSchema,
	SearchUsersAdminResponse,
	SearchUsersAdminResponseSchema,
	type AuthenticateUserResponse,
} from '@inverted-tech/fragments/Authentication';
import { getSession } from '@/lib/session';
import { toIso } from '@/lib/utils';
async function getToken() {
	const session = await getSession();
	return session.token;
}

const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}/auth`;
const ADMIN_API_BASE = `${API_BASE_URL}/auth/admin`;

export async function logoutAction(): Promise<boolean> {
	'use server';
	try {
		const session = await getSession();
		await session.destroy();
		return true;
	} catch (e) {
		try {
			console.error('logoutAction error:', e);
		} catch {}
		return false;
	}
}

export async function loginAction(
	payload: AuthenticateUserRequest,
): Promise<AuthenticateUserResponse> {
	const url = process.env.AUTH_LOGIN_URL || `${API_BASE_URL}/auth/login`;

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
			const session = await getSession();
			session.token = body.BearerToken;
			if (body.UserRecord?.Public?.Data?.UserName) {
				session.userName = body.UserRecord.Public.Data.UserName;
			}

			if (
				body.UserRecord?.Private?.Roles &&
				body.UserRecord.Private.Roles.length > 0
			) {
				session.roles = body.UserRecord.Private.Roles;
			}

			if (
				body.UserRecord?.Public?.Data?.DisplayName &&
				body.UserRecord.Public.Data.DisplayName !== ''
			) {
				session.displayName = body.UserRecord.Public.Data.DisplayName;
			}

			if (body.UserRecord?.Public?.Data?.ProfileImagePNG) {
				session.profileImageId =
					body.UserRecord.Public.Data.ProfileImagePNG;
			}

			if (
				body.UserRecord?.Public?.UserID &&
				body.UserRecord.Public.UserID !== ''
			) {
				session.id = body.UserRecord.Public.UserID;
			}

			await session.save();
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

export async function listUsers(
	req: SearchUsersAdminRequest = create(SearchUsersAdminRequestSchema, {
		PageSize: 25,
		PageOffset: 0,
		CreatedAfter: undefined,
		CreatedBefore: undefined,
		UserIDs: [],
		IncludeDeleted: true,
		Roles: [...Roles],
	}),
) {
	try {
		const token = await getToken();

		const parts: string[] = [];
		const enc = (k: string, v: string | number | boolean) =>
			`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;

		if (req.PageSize != null) parts.push(enc('PageSize', req.PageSize));
		if (req.PageOffset != null)
			parts.push(enc('PageOffset', req.PageOffset));
		if (req.SearchString?.trim())
			parts.push(enc('SearchString', req.SearchString.trim()));
		if (Array.isArray(req.Roles))
			for (const r of req.Roles) if (r) parts.push(enc('Roles', r));
		if (Array.isArray(req.UserIDs))
			for (const id of req.UserIDs)
				if (id) parts.push(enc('UserIDs', id));
		const ca = toIso((req as any)?.CreatedAfter);
		const cb = toIso((req as any)?.CreatedBefore);
		if (ca) parts.push(enc('CreatedAfter', ca));
		if (cb) parts.push(enc('CreatedBefore', cb));

		if (typeof req.IncludeDeleted === 'boolean')
			parts.push(enc('IncludeDeleted', req.IncludeDeleted));

		const base = (ADMIN_API_BASE ?? '').replace(/\/+$/, '');
		const qs = parts.join('&');
		const url = `${base}/search${qs ? `?${qs}` : ''}`;

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

		const session = await getSession();
		session.token = body.BearerToken;
		await session.save();
		return body;
	} catch (error) {
		console.error(error);
		return create(RenewTokenResponseSchema);
	}
}

export async function grantRolesToUser(req: ModifyOtherUserRolesRequest) {
	try {
		const token = await getToken();
		const res = await fetch(ADMIN_API_BASE.concat('/user/roles'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyOtherUserRolesRequestSchema, req),
		});

		if (!res) {
			return create(ModifyOtherUserRolesResponseSchema);
		}

		const body: ModifyOtherUserRolesResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ModifyOtherUserRolesResponseSchema);
	}
}

export async function enableUser(req: DisableEnableOtherUserRequest) {
	try {
		const token = await getToken();
		const res = await fetch(
			ADMIN_API_BASE.concat(`/user/${req.UserID}/enable`),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: toJsonString(DisableEnableOtherUserRequestSchema, req),
			},
		);

		if (!res) return create(DisableEnableOtherUserResponseSchema);

		const body: DisableEnableOtherUserResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(DisableEnableOtherUserResponseSchema);
	}
}

export async function disableUser(req: DisableEnableOtherUserRequest) {
	try {
		const token = await getToken();
		const res = await fetch(
			ADMIN_API_BASE.concat(`/user/${req.UserID}/disable`),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: toJsonString(DisableEnableOtherUserRequestSchema, req),
			},
		);

		if (!res) return create(DisableEnableOtherUserResponseSchema);

		const body: DisableEnableOtherUserResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(DisableEnableOtherUserResponseSchema);
	}
}

export async function getSessionUser() {
	try {
		const session = await getSession();
		return {
			id: session.id ?? '',
			userName: session.userName ?? '',
			displayName: session.displayName ?? '',
		};
	} catch {
		return { id: '', userName: '', displayName: '' };
	}
}

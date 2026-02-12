'use server';

import { Roles } from '@/lib/types';
import { create, toJsonString } from '@bufbuild/protobuf';
import {
	CreateUserRequest,
	CreateUserRequestSchema,
	CreateUserResponse,
	CreateUserResponseSchema,
	AuthenticateUserRequest,
	AuthenticateUserResponseSchema,
	ChangeOtherPasswordRequest,
	ChangeOtherPasswordRequestSchema,
	ChangeOtherPasswordResponse,
	ChangeOtherPasswordResponseSchema,
	DisableEnableOtherUserRequest,
	DisableEnableOtherUserRequestSchema,
	DisableEnableOtherUserResponse,
	DisableEnableOtherUserResponseSchema,
	DisableOtherTotpRequest,
	DisableOtherTotpRequestSchema,
	DisableOtherTotpResponse,
	DisableOtherTotpResponseSchema,
	GetOtherTotpListResponse,
	GetOtherTotpListResponseSchema,
	GetOtherUserResponse,
	GetOtherUserResponseSchema,
	GetOwnUserResponse,
	GetOwnUserResponseSchema,
	ModifyOtherUserRequest,
	ModifyOtherUserRequestSchema,
	ModifyOtherUserResponse,
	ModifyOtherUserResponseSchema,
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
import {
	clearTokenCookie,
	getSession,
	getTokenCookie,
	setTokenCookie,
} from '@/lib/session';
import { toIso } from '@/lib/utils';
import { isAdminOrHigher, isMemberManagerOrHigher } from '@/lib/roleHelpers';
import {
	APIErrorReason,
	APIErrorSchema,
} from '@inverted-tech/fragments/protos/index';
async function getToken() {
	return getTokenCookie();
}

const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}/auth`;
const ADMIN_API_BASE = `${API_BASE_URL}/auth/admin`;

export async function logoutAction(): Promise<boolean> {
	'use server';
	try {
		await clearTokenCookie();
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

export async function getOwnUser() {
	try {
		const url = API_BASE.concat('/user');
		const token = await getToken();
		if (!token) {
			return create(GetOwnUserResponseSchema, {});
		}

		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body: GetOwnUserResponse = await res.json();
		return body;
	} catch (error) {
		console.error('Error Getting Own User: ', error);
		return create(GetOwnUserResponseSchema, {});
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
				Error: create(APIErrorSchema, {
					Message: 'No Response Recieved From The Server',
					Reason: APIErrorReason.ERROR_REASON_SERVICE_UNAVAILABLE,
				}),
			});
		}

		const body: AuthenticateUserResponse = await res.json();

		if (body.ok && body.BearerToken && body.BearerToken !== '') {
			await setTokenCookie(body.BearerToken);
			const session = await getSession();
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
			Error: create(APIErrorSchema, {
				Message: 'Unknown Error',
				Reason: APIErrorReason.ERROR_REASON_UNKNOWN,
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

		await setTokenCookie(body.BearerToken);
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

export async function adminGetUserTotpDevices(userId: string) {
	try {
		const roles = (await getSession()).roles ?? [];
		if (!isAdminOrHigher(roles)) {
			return create(GetOtherTotpListResponseSchema, {});
		}
		const token = await getToken();
		if (!token || token === '')
			return create(GetOtherTotpListResponseSchema, {});

		const res = await fetch(ADMIN_API_BASE.concat(`/totp/${userId}`), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body: GetOtherTotpListResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetOtherTotpListResponseSchema, {});
	}
}

export async function adminDisableOtherTotp(req: DisableOtherTotpRequest) {
	try {
		const token = await getToken();
		if (!token || token === '')
			return create(DisableOtherTotpResponseSchema, {});

		const res = await fetch(ADMIN_API_BASE.concat('/totp/disable'), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: toJsonString(DisableOtherTotpRequestSchema, req),
		});

		if (!res) return create(DisableOtherTotpResponseSchema, {});

		const body: DisableOtherTotpResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(DisableOtherTotpResponseSchema, {});
	}
}

export async function adminEditOtherUserPassword(
	req: ChangeOtherPasswordRequest,
) {
	try {
		const token = await getToken();
		if (!token || token === '')
			return create(ChangeOtherPasswordResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHENTICATED,
					Message: 'Not Logged In',
					Validation: [],
				}),
			});

		const roles = (await getSession()).roles;
		if (!roles || roles.length < 0)
			return create(ChangeOtherPasswordResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHENTICATED,
					Message: 'Not Logged In',
					Validation: [],
				}),
			});

		if (!isMemberManagerOrHigher(roles))
			return create(ChangeOtherPasswordResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHORIZED,
					Message: 'User Does Not Have Required Role',
					Validation: [],
				}),
			});

		const res = await fetch(ADMIN_API_BASE.concat('/password'), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: toJsonString(ChangeOtherPasswordRequestSchema, req),
		});
		const body: ChangeOtherPasswordResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ChangeOtherPasswordResponseSchema, {
			Error: create(APIErrorSchema, {
				Reason: APIErrorReason.ERROR_REASON_UNKNOWN,
				Message: 'An Error Has Occured Changing A Users Password',
				Validation: [],
			}),
		});
	}
}

export async function adminEditOtherUser(req: ModifyOtherUserRequest) {
	try {
		const token = await getToken();
		if (!token || token === '')
			return create(ModifyOtherUserResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHENTICATED,
					Message: 'Not Logged In',
					Validation: [],
				}),
			});

		const roles = (await getSession()).roles;
		if (!roles || roles.length < 0)
			return create(ModifyOtherUserResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHENTICATED,
					Message: 'Not Logged In',
					Validation: [],
				}),
			});

		if (!isMemberManagerOrHigher(roles))
			return create(ModifyOtherUserResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_UNAUTHORIZED,
					Message: 'User Does Not Have Required Role',
					Validation: [],
				}),
			});

		const res = await fetch(ADMIN_API_BASE.concat('/user'), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: toJsonString(ModifyOtherUserRequestSchema, req),
		});

		const body: ModifyOtherUserResponse = await res.json();

		return body;
	} catch (error) {
		console.error(error);
		return create(ModifyOtherUserResponseSchema, {
			Error: create(APIErrorSchema, {
				Reason: APIErrorReason.ERROR_REASON_UNKNOWN,
				Message: 'An Error Ocurred While Trying To Modify Other User',
				Validation: [],
			}),
		});
	}
}

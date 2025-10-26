'use server';

import { create } from '@bufbuild/protobuf';
import {
	AuthenticateUserRequest,
	AuthenticateUserResponseSchema,
	AuthErrorReason,
	AuthErrorSchema,
	GetOtherUserResponse,
	GetOtherUserResponseSchema,
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

export async function listUsers() {
	try {
		const token = await getToken();
		const url = ADMIN_API_BASE.concat('/user');

		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!res) {
			return create(SearchUsersAdminResponseSchema);
		}

		const body: SearchUsersAdminResponse = await res.json();
		return body;
	} catch (error) {
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

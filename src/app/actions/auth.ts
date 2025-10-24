'use server';

import { create } from '@bufbuild/protobuf';
import {
	AuthenticateUserRequest,
	AuthenticateUserResponseSchema,
	AuthErrorReason,
	AuthErrorSchema,
	type AuthenticateUserResponse,
} from '@inverted-tech/fragments/Authentication';
import { cookies } from 'next/headers';

export type LoginPayload = {
	UserName: string;
	Password: string;
};

export type LoginResult =
	| {
			ok: true;
			data: AuthenticateUserResponse;
			tokenSet: boolean;
	  }
	| {
			ok: false;
			status?: number;
			statusText?: string;
			error?: string;
			data?: Partial<AuthenticateUserResponse> | unknown;
	  };

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

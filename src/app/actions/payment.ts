'use server';

import { getSession } from '@/lib/session';
import { create, toJsonString } from '@bufbuild/protobuf';
import {
	CancelOtherSubscriptionRequestSchema,
	CancelSubscriptionResponse,
	CancelSubscriptionResponseSchema,
	GetSubscriptionRecordResponseSchema,
	ListSubscriptionsResponseSchema,
	PaymentErrorSchema,
} from '@inverted-tech/fragments/Authorization/Payment/index';

const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}`;
async function getToken() {
	const session = await getSession();
	return session.token;
}

export async function getSubscriptionsForUser(userId: string) {
	try {
		const token = await getToken();
		if (!token) throw new Error('No auth token');

		const url = `${API_BASE}/payment/admin/user/${encodeURIComponent(userId)}/subscription`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res) {
			return create(GetSubscriptionRecordResponseSchema, {});
		}
		const body = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetSubscriptionRecordResponseSchema, {});
	}
}

// TODO: Find ListSubscriptionsRequest and Response protos
export async function listSubscriptions(
	pageSize: number,
	pageOffset: number,
	includeInactive: boolean = false,
) {
	try {
		const token = await getToken();
		if (!token) throw new Error('No auth token');

		const url = `${API_BASE}/payment/admin/subscriptions?PageSize=${pageSize}&PageOffset=${pageOffset}&IncludeInactive=${includeInactive}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res) {
			return create(ListSubscriptionsResponseSchema, {});
		}
		const body = await res.json();
		return create(ListSubscriptionsResponseSchema, body);
	} catch (error) {
		console.error(error);
		return create(ListSubscriptionsResponseSchema, {});
	}
}

export async function cancelSubscription(
	userId: string,
	internalSubscriptionId: string,
) {
	try {
		const token = await getToken();
		if (!token) throw new Error('No auth token');
		// TODO: Add Better Auth Gating, Return Error
		const req = create(CancelOtherSubscriptionRequestSchema, {
			UserID: userId,
			InternalSubscriptionID: internalSubscriptionId,
		});

		const url = `${API_BASE}/payment/admin/user/${userId}/subscription/${internalSubscriptionId}/cancel`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(CancelOtherSubscriptionRequestSchema, req),
		});

		const body: CancelSubscriptionResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(CancelSubscriptionResponseSchema, {
			Error: 'Unknown Error',
		});
	}
}

export async function cancelSubscribition(formData: FormData) {
	'use server';
	const userId = String(formData.get('userId') ?? '').trim();
	const internalSubscriptionId = String(
		formData.get('internalSubscriptionId') ?? '',
	).trim();
	if (!userId || !internalSubscriptionId) return;
	await cancelSubscription(userId, internalSubscriptionId);
}

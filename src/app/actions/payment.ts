'use server';

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

export async function getSubscriptionsForUser(userId: string) {
	try {
		const url = `${API_BASE}/payment/admin/user/${encodeURIComponent(userId)}/subscription`;
		const res = await fetch(url, {
			method: 'GET',
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

export async function cancelSubscription(
	userId: string,
	internalSubscriptionId: string,
) {
	try {
		const req = create(CancelOtherSubscriptionRequestSchema, {
			UserID: userId,
			InternalSubscriptionID: internalSubscriptionId,
		});

		const url = `${API_BASE}/payment/admin/user/${userId}/subscription/${internalSubscriptionId}/cancel`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
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

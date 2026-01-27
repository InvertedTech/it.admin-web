'use server';

import { getSession } from '@/lib/session';
import { create } from '@bufbuild/protobuf';
import { GetSubscriptionRecordResponseSchema } from '@inverted-tech/fragments/Authorization/Payment/index';

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

'use server';
import { authHeaders } from '@/lib/cookies';
import { create } from '@bufbuild/protobuf';
import {
	GetKpisResponse,
	GetKpisResponseSchema,
} from '@inverted-tech/fragments/Dashboard';

const API_BASE = process.env.API_BASE_URL!;
const API_ADMIN_BASE = API_BASE.concat('/admin/dashboard');

export async function getKpis() {
	try {
		const res = await fetch(API_ADMIN_BASE, {
			method: 'GET',
			headers: {
				...(await authHeaders()),
			},
		});

		const body: GetKpisResponse = await res.json();
		return body;
	} catch (error) {
		console.error('Error Getting KPIS: ', error);
		return create(GetKpisResponseSchema);
	}
}

'use server';
import { authHeaders } from '@/lib/cookies';
import { create } from '@bufbuild/protobuf';
import {
	GetKpisResponse,
	GetKpisResponseSchema,
} from '@inverted-tech/fragments/Dashboard';
import { apiClient } from '@/lib/apiBase';

export async function getKpis() {
	try {
		const res = await apiClient.call<GetKpisResponse>(
			apiClient.endpoints.dashboard.getDashboard,
			{
				method: 'GET',
				headers: {
					...(await authHeaders()),
				},
			},
		);

		return res;
	} catch (error) {
		console.error('Error Getting KPIS: ', error);
		return create(GetKpisResponseSchema);
	}
}

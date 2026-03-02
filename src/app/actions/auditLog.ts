'use server';
import { authHeaders } from '@/lib/cookies';
import { create } from '@bufbuild/protobuf';
import { APIErrorReason, APIErrorSchema } from '@inverted-tech/fragments';
import {
	SearchEntriesRequest,
	SearchEntriesResponse,
	SearchEntriesResponseSchema,
} from '@inverted-tech/fragments/AuditLog';
import { apiClient } from '@/lib/apiBase';

export async function searchAuditLogEntries(req: SearchEntriesRequest) {
	try {
		const url = new URL(apiClient.endpoints.auditLog.adminGetAuditLog);
		if (req.PageSize != null) {
			url.searchParams.set('PageSize', String(req.PageSize));
		}
		if (req.PageOffset != null) {
			url.searchParams.set('PageOffset', String(req.PageOffset));
		}

		const res = await apiClient.call<SearchEntriesResponse>(
			url.toString(),
			{
				method: 'GET',
				headers: {
					...(await authHeaders()),
				},
			},
		);

		return res;
	} catch (error) {
		console.error(`Error searching audit logs: `, error);
		return create(SearchEntriesResponseSchema, {
			Error: create(APIErrorSchema, {
				Reason: APIErrorReason.ERROR_REASON_UNKNOWN,
				Message: `Failed To Search Entries`,
			}),
		});
	}
}

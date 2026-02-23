'use server';
import { authHeaders } from '@/lib/cookies';
import { create } from '@bufbuild/protobuf';
import { APIErrorReason, APIErrorSchema } from '@inverted-tech/fragments';
import {
	SearchEntriesRequest,
	SearchEntriesResponse,
	SearchEntriesResponseSchema,
} from '@inverted-tech/fragments/AuditLog';

const API_BASE_URL = process.env.API_BASE_URL!;

export async function searchAuditLogEntries(req: SearchEntriesRequest) {
	try {
		const url = new URL(`${API_BASE_URL}/admin/audit-log`);
		if (req.PageSize != null) {
			url.searchParams.set('PageSize', String(req.PageSize));
		}
		if (req.PageOffset != null) {
			url.searchParams.set('PageOffset', String(req.PageOffset));
		}

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: { ...(await authHeaders()) },
		});

		if (!res) {
			return create(SearchEntriesResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_DELIVERY_FAILED,
					Message: 'Server did not respond',
				}),
			});
		}

		const body: SearchEntriesResponse = await res.json();
		return body;
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

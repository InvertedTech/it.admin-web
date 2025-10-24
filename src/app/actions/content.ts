'use server';
import { cache } from 'react';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { cookies } from 'next/headers';
import {
	CreateContentRequest,
	CreateContentRequestSchema,
	CreateContentResponse,
	CreateContentResponseSchema,
} from '@inverted-tech/fragments/protos/Content/Content_pb';
async function getToken() {
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;
	return token;
}

const ADMIN_CONTENT_TAG = 'admin-content';

export async function createContent(req: CreateContentRequest) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/cms/admin/content';
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			method: 'POST',
			body: toJsonString(CreateContentRequestSchema, req),
		});

		if (!res) {
			return create(CreateContentResponseSchema);
		}

		const body: CreateContentResponse = await res.json();
		if (!body) {
			return create(CreateContentResponseSchema);
		}

		return body;
	} catch (error) {
		console.error(error);
		return create(CreateContentResponseSchema);
	}
}

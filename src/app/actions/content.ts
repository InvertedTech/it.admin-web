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
	GetAllContentAdminResponse,
	GetAllContentAdminResponseSchema,
} from '@inverted-tech/fragments/Content';
async function getToken() {
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;
	return token;
}

const ADMIN_CONTENT_TAG = 'admin-content';
const API_BASE = 'http://localhost:8001/api/cms/admin/content';

export async function createContent(req: CreateContentRequest) {
	try {
		const token = await getToken();
		const res = await fetch(API_BASE, {
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

// TODO: Add GetAdminContentRequest
export async function getContent() {
	try {
		const token = await getToken();
		const res = await fetch(API_BASE, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'GET',
		});

		if (!res) return create(GetAllContentAdminResponseSchema);

		const body: GetAllContentAdminResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetAllContentAdminResponseSchema);
	}
}

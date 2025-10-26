'use server';
import { cache } from 'react';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { cookies } from 'next/headers';
import {
	AnnounceContentRequest,
	AnnounceContentRequestSchema,
	AnnounceContentResponse,
	AnnounceContentResponseSchema,
	CreateContentRequest,
	CreateContentRequestSchema,
	CreateContentResponse,
	CreateContentResponseSchema,
	GetAllContentAdminResponse,
	GetAllContentAdminResponseSchema,
	GetContentAdminResponse,
	GetContentAdminResponseSchema,
	PublishContentRequest,
	PublishContentRequestSchema,
	PublishContentResponse,
	PublishContentResponseSchema,
	UnannounceContentRequest,
	UnannounceContentRequestSchema,
	UnannounceContentResponse,
	UnannounceContentResponseSchema,
	UnpublishContentRequest,
	UnpublishContentRequestSchema,
	UnpublishContentResponse,
	UnpublishContentResponseSchema,
	DeleteContentRequest,
	DeleteContentRequestSchema,
	DeleteContentResponse,
	DeleteContentResponseSchema,
	UndeleteContentRequest,
	UndeleteContentRequestSchema,
	UndeleteContentResponse,
	UndeleteContentResponseSchema,
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

export async function adminGetContent(contentId: string) {
	try {
		const token = await getToken();
		const res = await fetch(API_BASE.concat(`/${contentId}`), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'GET',
		});

		if (!res) {
			return create(GetContentAdminResponseSchema);
		}

		const body: GetContentAdminResponse = await res.json();
		return body;
	} catch (error) {
		return create(GetContentAdminResponseSchema);
	}
}

export async function publishContent(req: PublishContentRequest) {
	try {
		const token = await getToken();
		const url = API_BASE.concat(`/${req.ContentID}/publish`);
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'POST',
			body: toJsonString(PublishContentRequestSchema, req),
		});

		if (!res) {
			return create(PublishContentResponseSchema);
		}

		const body: PublishContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(PublishContentResponseSchema);
	}
}

export async function unpublishContent(req: UnpublishContentRequest) {
	try {
		const token = await getToken();
		const url = API_BASE.concat(`/${req.ContentID}/unpublish`);
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'POST',
			body: toJsonString(UnpublishContentRequestSchema, req),
		});

		if (!res) {
			return create(UnpublishContentResponseSchema);
		}

		const body: UnpublishContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(UnpublishContentResponseSchema);
	}
}

export async function announceContent(req: AnnounceContentRequest) {
    try {
        const token = await getToken();
        const url = API_BASE.concat(`/${req.ContentID}/announce`);
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            method: 'POST',
            body: toJsonString(AnnounceContentRequestSchema, req),
        });

		if (!res) {
			return create(AnnounceContentResponseSchema);
		}

		const body: AnnounceContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(AnnounceContentResponseSchema);
	}
}

export async function unannounceContent(req: UnannounceContentRequest) {
    try {
        const token = await getToken();
        const url = API_BASE.concat(`/${req.ContentID}/unannounce`);
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            method: 'POST',
            body: toJsonString(UnannounceContentRequestSchema, req),
        });

		if (!res) {
			return create(UnannounceContentResponseSchema);
		}

		const body: UnannounceContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(UnannounceContentResponseSchema);
	}
}

export async function deleteContent(req: DeleteContentRequest) {
	try {
		const token = await getToken();
		const url = API_BASE.concat(`/${req.ContentID}/delete`);
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'POST',
			body: toJsonString(DeleteContentRequestSchema, req),
		});

		if (!res) {
			return create(DeleteContentResponseSchema);
		}

		const body: DeleteContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(DeleteContentResponseSchema);
	}
}

export async function undeleteContent(req: UndeleteContentRequest) {
	try {
		const token = await getToken();
		const url = API_BASE.concat(`/${req.ContentID}/undelete`);
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'POST',
			body: toJsonString(UndeleteContentRequestSchema, req),
		});

		if (!res) {
			return create(UndeleteContentResponseSchema);
		}

		const body: UndeleteContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(UndeleteContentResponseSchema);
	}
}

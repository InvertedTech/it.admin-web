'use server';

import { authHeaders } from '@/lib/cookies';
import { create, toJsonString } from '@bufbuild/protobuf';
import {
	AdminDeleteCommentRequest,
	AdminDeleteCommentRequestSchema,
	AdminDeleteCommentResponse,
	AdminDeleteCommentResponseSchema,
	AdminPinCommentRequest,
	AdminPinCommentRequestSchema,
	AdminPinCommentResponse,
	AdminPinCommentResponseSchema,
	AdminUnDeleteCommentRequest,
	AdminUnDeleteCommentRequestSchema,
	AdminUnDeleteCommentResponse,
	AdminUnDeleteCommentResponseSchema,
	AdminUnPinCommentRequest,
	AdminUnPinCommentRequestSchema,
	AdminUnPinCommentResponse,
	AdminUnPinCommentResponseSchema,
	CreateCommentForCommentRequest,
	CreateCommentForCommentRequestSchema,
	CreateCommentForContentRequest,
	CreateCommentForContentRequestSchema,
	CreateCommentResponse,
	CreateCommentResponseSchema,
	GetCommentsForCommentRequest,
	GetCommentsForContentRequest,
	GetCommentsResponse,
	GetCommentsResponseSchema,
	LikeCommentRequest,
	LikeCommentRequestSchema,
	LikeCommentResponse,
	LikeCommentResponseSchema,
	UnLikeCommentRequest,
	UnLikeCommentRequestSchema,
	UnLikeCommentResponse,
	UnLikeCommentResponseSchema,
} from '@inverted-tech/fragments/Comment';

const API_BASE_URL = process.env.API_BASE_URL!;

export async function getCommentsForContent(
	req: GetCommentsForContentRequest,
): Promise<GetCommentsResponse> {
	try {
		const url = new URL(
			`/api/comment/content/${req.ContentID}`,
			API_BASE_URL,
		);

		if (req.Order) {
			url.searchParams.append('Order', req.Order.toString());
		}

		if (req.PageSize) {
			url.searchParams.append('PageSize', req.PageSize.toString());
		}

		if (req.PageOffset) {
			url.searchParams.append('PageOffset', req.PageOffset.toString());
		}

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				...(await authHeaders()),
			},
		});

		if (!res) return create(GetCommentsResponseSchema);
		const body: GetCommentsResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetCommentsResponseSchema);
	}
}

export async function getCommentsForComment(req: GetCommentsForCommentRequest) {
	try {
		const url = new URL(
			`/api/comment/${req.ParentCommentID}`,
			API_BASE_URL,
		);

		if (req.Order) {
			url.searchParams.append('Order', req.Order.toString());
		}

		if (req.PageSize) {
			url.searchParams.append('PageSize', req.PageSize.toString());
		}

		if (req.PageOffset) {
			url.searchParams.append('PageOffset', req.PageOffset.toString());
		}

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				...(await authHeaders()),
			},
		});

		if (!res) return create(GetCommentsResponseSchema);
		const body: GetCommentsResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetCommentsResponseSchema);
	}
}

export async function createCommentForContent(
	req: CreateCommentForContentRequest,
): Promise<CreateCommentResponse> {
	try {
		const url = new URL(
			`/api/comment/content/${req.ContentID}/create`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
			},
			body: toJsonString(CreateCommentForContentRequestSchema, req),
		});

		if (!res) return create(CreateCommentResponseSchema);
		const body: CreateCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(CreateCommentResponseSchema);
	}
}

export async function createCommentForComment(
	req: CreateCommentForCommentRequest,
): Promise<CreateCommentResponse> {
	try {
		const url = new URL(
			`/api/comment/${req.ParentCommentID}/create`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
			},
			body: toJsonString(CreateCommentForCommentRequestSchema, req),
		});

		if (!res) return create(CreateCommentResponseSchema);
		const body: CreateCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(CreateCommentResponseSchema);
	}
}

export async function pinComment(req: AdminPinCommentRequest) {
	try {
		const url = new URL(`/api/comment/admin/${req.CommentID}/pin`, API_BASE_URL);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(AdminPinCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(AdminPinCommentResponseSchema);
		const body: AdminPinCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(AdminPinCommentResponseSchema);
	}
}

export async function unpinComment(req: AdminUnPinCommentRequest) {
	try {
		const url = new URL(
			`/api/comment/admin/${req.CommentID}/unpin`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(AdminUnPinCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(AdminUnPinCommentResponseSchema);
		const body: AdminUnPinCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(AdminUnPinCommentResponseSchema);
	}
}

export async function deleteComment(req: AdminDeleteCommentRequest) {
	try {
		const url = new URL(
			`/api/comment/admin/${req.CommentID}/delete`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(AdminDeleteCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(AdminDeleteCommentResponseSchema);
		const body: AdminDeleteCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(AdminDeleteCommentResponseSchema);
	}
}

export async function undeleteComment(req: AdminUnDeleteCommentRequest) {
	try {
		const url = new URL(
			`/api/comment/admin/${req.CommentID}/undelete`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(AdminUnDeleteCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(AdminUnDeleteCommentResponseSchema);
		const body: AdminUnDeleteCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(AdminUnDeleteCommentResponseSchema);
	}
}

export async function likeComment(req: LikeCommentRequest) {
	try {
		const url = new URL(`/api/comment/${req.CommentID}/like`, API_BASE_URL);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(LikeCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(LikeCommentResponseSchema);
		const body: LikeCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(LikeCommentResponseSchema);
	}
}

export async function unlikeComment(req: UnLikeCommentRequest) {
	try {
		const url = new URL(
			`/api/comment/${req.CommentID}/unlike`,
			API_BASE_URL,
		);
		const res = await fetch(url.toString(), {
			method: 'POST',
			body: toJsonString(UnLikeCommentRequestSchema, req),
			headers: {
				...(await authHeaders()),
				'content-type': 'application/json',
			},
		});

		if (!res) return create(UnLikeCommentResponseSchema);
		const body: UnLikeCommentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(UnLikeCommentResponseSchema);
	}
}

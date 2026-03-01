'use server';
import {
	CreateCareerRequest,
	CreateCareerRequestSchema,
	CreateCareerResponse,
	CreateCareerResponseSchema,
	ListCareersRequest,
	ListCareersResponse,
	ListCareersResponseSchema,
	GetCareerRequest,
	GetCareerResponse,
	GetCareerResponseSchema,
	UpdateCareerRequest,
	UpdateCareerRequestSchema,
	UpdateCareerResponse,
	UpdateCareerResponseSchema,
	DeleteCareerRequest,
	DeleteCareerRequestSchema,
	DeleteCareerResponse,
	DeleteCareerResponseSchema,
	AdminListCareersRequest,
} from '@inverted-tech/fragments/Careers';
import { create, fromJson, toJsonString } from '@bufbuild/protobuf';
import { authHeaders } from '@/lib/cookies';
import {
	APIErrorReason,
	APIErrorReasonSchema,
	APIErrorSchema,
} from '@inverted-tech/fragments';

const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}/careers`;
const API_ADMIN_BASE = `${API_BASE_URL}/admin/careers`;

export async function listCareers(
	req: AdminListCareersRequest,
): Promise<ListCareersResponse> {
	try {
		const url = new URL(API_ADMIN_BASE);

		if (req.PageSize) {
			url.searchParams.append('PageSize', req.PageSize.toString());
		}

		if (req.PageOffset) {
			url.searchParams.append('PageOffset', req.PageOffset.toString());
		}

		if (req.IncludeDeleted) {
			url.searchParams.append('IncludeDeleted', 'true');
		}

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				...(await authHeaders()),
			},
		});

		if (!res) return create(ListCareersResponseSchema);
		const body: ListCareersResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ListCareersResponseSchema);
	}
}

export async function getCareer(
	req: GetCareerRequest,
): Promise<GetCareerResponse> {
	try {
		const res = await fetch(`${API_BASE}/${req.CareerId}`, {
			method: 'GET',
		});

		if (!res) return create(GetCareerResponseSchema);
		const body = fromJson(GetCareerResponseSchema, await res.json());
		return body;
	} catch (error) {
		console.error(error);
		return create(GetCareerResponseSchema);
	}
}

export async function createCareer(
	req: CreateCareerRequest,
): Promise<CreateCareerResponse> {
	try {
		const res = await fetch(API_ADMIN_BASE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
			},
			body: toJsonString(CreateCareerRequestSchema, req),
		});

		if (!res) return create(CreateCareerResponseSchema);
		const body: CreateCareerResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(CreateCareerResponseSchema);
	}
}

export async function updateCareer(
	req: UpdateCareerRequest,
): Promise<UpdateCareerResponse> {
	try {
		const res = await fetch(`${API_ADMIN_BASE}/${req.CareerId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
			},
			body: toJsonString(UpdateCareerRequestSchema, req),
		});
		if (!res)
			return create(UpdateCareerResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_DELIVERY_FAILED,
					Message: 'Server Did Not Send A Response, Try Again Later',
				}),
			});
		const body: UpdateCareerResponse = await res.json();
		return body;
	} catch (error: any) {
		console.error(error);
		return create(UpdateCareerResponseSchema, {
			Error: create(APIErrorSchema, {
				Reason: APIErrorReason.ERROR_REASON_PROVIDER_ERROR,
				Message: error.message ?? 'Server Error, Try Again Later',
			}),
		});
	}
}

export async function deleteCareer(
	req: DeleteCareerRequest,
): Promise<DeleteCareerResponse> {
	try {
		console.log(`${API_BASE_URL}/admin/careers/${req.CareerId}`);
		const res = await fetch(
			`${API_BASE_URL}/admin/careers/${req.CareerId}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					...(await authHeaders()),
				},
				body: toJsonString(DeleteCareerRequestSchema, req),
			},
		);
		if (!res)
			return create(DeleteCareerResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_DELIVERY_FAILED,
					Message: 'Server Did Not Respond',
				}),
			});
		const body: DeleteCareerResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(DeleteCareerResponseSchema);
	}
}

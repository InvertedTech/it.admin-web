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
import { apiClient } from '@/lib/apiBase';

export async function listCareers(
	req: AdminListCareersRequest,
): Promise<ListCareersResponse> {
	try {
		const url = new URL(apiClient.endpoints.careers.getCareersAdmin);

		if (req.PageSize) {
			url.searchParams.append('PageSize', req.PageSize.toString());
		}

		if (req.PageOffset) {
			url.searchParams.append('PageOffset', req.PageOffset.toString());
		}

		if (req.IncludeDeleted) {
			url.searchParams.append('IncludeDeleted', 'true');
		}

		const res = await apiClient.call<ListCareersResponse>(url.toString(), {
			method: 'GET',
			headers: {
				...(await authHeaders()),
			},
		});

		return res;
	} catch (error) {
		console.error(error);
		return create(ListCareersResponseSchema);
	}
}

export async function getCareer(
	req: GetCareerRequest,
): Promise<GetCareerResponse> {
	try {
		const res = await apiClient.call<GetCareerResponse>(
			apiClient.endpoints.careers.getCareer(req.CareerId),
			{
				method: 'GET',
				headers: {
					...(await authHeaders()),
				},
			},
		);

		return res;
	} catch (error) {
		console.error(error);
		return create(GetCareerResponseSchema);
	}
}

export async function createCareer(
	req: CreateCareerRequest,
): Promise<CreateCareerResponse> {
	try {
		const res = await apiClient.call<CreateCareerResponse>(
			apiClient.endpoints.careers.createCareer,
			{
				method: 'POST',
				headers: {
					...(await authHeaders()),
				},
				body: toJsonString(CreateCareerRequestSchema, req),
			},
		);

		return res;
	} catch (error) {
		console.error(error);
		return create(CreateCareerResponseSchema);
	}
}

export async function updateCareer(
	req: UpdateCareerRequest,
): Promise<UpdateCareerResponse> {
	try {
		const res = await apiClient.call<UpdateCareerResponse>(
			apiClient.endpoints.careers.adminUpdateCareer(req.CareerId),
			{
				method: 'PUT',
				headers: {
					...(await authHeaders()),
				},
				body: toJsonString(UpdateCareerRequestSchema, req),
			},
		);

		return res;
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
		const res = await apiClient.call<DeleteCareerResponse>(
			apiClient.endpoints.careers.adminDeleteCareer(req.CareerId),
			{
				method: 'DELETE',
				headers: {
					...(await authHeaders()),
				},
				body: toJsonString(DeleteCareerRequestSchema, req),
			},
		);

		return res;
	} catch (error) {
		console.error(error);
		return create(DeleteCareerResponseSchema);
	}
}

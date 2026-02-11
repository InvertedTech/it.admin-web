'use server';

import { create, toJsonString } from '@bufbuild/protobuf';
import { getTokenCookie } from '@/lib/session';
import { revalidatePath, revalidateTag } from 'next/cache';

import {
	SearchAssetRequest,
	SearchAssetResponse,
	SearchAssetResponseSchema,
	CreateAssetRequest,
	CreateAssetResponse,
	CreateAssetResponseSchema,
	CreateAssetRequestSchema,
	GetAssetAdminResponse,
	GetAssetAdminResponseSchema,
} from '@inverted-tech/fragments/Content/index';
import { AssetType } from '@inverted-tech/fragments/Content/AssetInterface_pb';

async function getToken() {
	return getTokenCookie();
}

const API_BASE_URL = process.env.API_BASE_URL!;
const ADMIN_ASSETS_TAG = 'admin-assets';

export async function getAsset(assetId: string) {
	try {
		const url = `${API_BASE_URL}/cms/admin/asset/${encodeURIComponent(assetId)}`;
		const token = await getToken();
		const res = await fetch(url, {
			method: 'GET',
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			next: { tags: [ADMIN_ASSETS_TAG], revalidate: 30 },
		});
		if (!res) return create(GetAssetAdminResponseSchema);
		const body: GetAssetAdminResponse = await res.json();
		return body ?? create(GetAssetAdminResponseSchema);
	} catch (error) {
		console.error(error);
		return create(GetAssetAdminResponseSchema);
	}
}

export async function getImages() {
	try {
		const url = `${API_BASE_URL}/cms/admin/asset/image`;
		const token = await getToken();

		const res = await fetch(url, {
			method: 'GET',
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			next: {
				tags: [ADMIN_ASSETS_TAG],
				revalidate: 30,
			},
		});

		if (!res) {
			return create(SearchAssetResponseSchema);
		}

		const body: SearchAssetResponse = await res.json();
		if (!body) {
			return create(SearchAssetResponseSchema);
		}

		return body;
	} catch (error) {
		console.error(error);
		return create(SearchAssetResponseSchema);
	}
}

export async function searchAssets(
	req?: Partial<SearchAssetRequest> & { AssetType?: number | string },
	opts?: { noCache?: boolean },
) {
	try {
		const base = `${API_BASE_URL}/cms/admin/asset/search`;
		const url = new URL(base);
		if (req?.PageSize != null)
			url.searchParams.set('PageSize', String(req.PageSize));
		if (req?.PageOffset != null)
			url.searchParams.set('PageOffset', String(req.PageOffset));
		if (req?.Query) url.searchParams.set('Query', String(req.Query));
		if (req?.AssetType != null) {
			let at: string;
			if (typeof req.AssetType === 'number') {
				at = (AssetType as any)[req.AssetType] ?? String(req.AssetType);
			} else {
				at = String(req.AssetType);
			}
			url.searchParams.set('AssetType', at);
		}

		const token = await getToken();
		const fetchOptions: RequestInit = {
			method: 'GET',
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		};
		if (opts?.noCache) {
			fetchOptions.cache = 'no-store';
		} else {
			(fetchOptions as any).next = {
				tags: [ADMIN_ASSETS_TAG],
				revalidate: 30,
			};
		}

		const res = await fetch(url.toString(), fetchOptions);

		if (!res) return create(SearchAssetResponseSchema);
		const body: SearchAssetResponse = await res.json();
		return body ?? create(SearchAssetResponseSchema);
	} catch (error) {
		console.error(error);
		return create(SearchAssetResponseSchema);
	}
}

export async function createAsset(req: CreateAssetRequest) {
	const url = `${API_BASE_URL}/cms/admin/asset`;
	const token = await getToken();

	try {
		// Ensure proper message instance for JSON encoding
		const msg = create(CreateAssetRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(CreateAssetRequestSchema, msg),
		});

		if (!res) {
			return create(CreateAssetResponseSchema);
		}

		const body: CreateAssetResponse = await res.json();
		if (!body) {
			return create(CreateAssetResponseSchema);
		}

		try {
			revalidateTag(ADMIN_ASSETS_TAG);
			revalidatePath('/content/assets');
		} catch {}

		return body;
	} catch (error) {
		console.error(error);
		return create(CreateAssetResponseSchema);
	}
}

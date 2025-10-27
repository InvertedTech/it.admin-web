'use server';

import { cache } from 'react';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { cookies } from 'next/headers';
import {
	GetAdminDataResponse,
	GetAdminDataResponseSchema,
	ChannelRecord,
	CategoryRecord,
	ModifySubscriptionPublicDataRequest,
	ModifySubscriptionPublicDataResponseSchema,
	ModifySubscriptionPublicDataResponse,
	SettingsErrorSchema,
	SettingsErrorReason,
	ChannelRecordSchema,
	CategoryRecordSchema,
	ModifySubscriptionPublicDataRequestSchema,
	ModifyCMSPublicDataRequestSchema,
	ModifyCMSPublicDataRequest,
	ModifyCMSPublicDataResponse,
	ModifyCMSPublicDataResponseSchema,
} from '@inverted-tech/fragments/Settings';

async function getToken() {
	const cookieStore = await cookies();
	const token = await cookieStore.get('token')?.value;
	return token;
}

const ADMIN_SETTINGS_TAG = 'admin-settings';

const _getAdminSettings = cache(async (token?: string) => {
	const url = 'http://localhost:8001/api/settings/admin';
	try {
		const res = await fetch(url, {
			method: 'GET',
			// Tag + small revalidate window to avoid spamming while enabling mutations to bust cache
			next: { tags: [ADMIN_SETTINGS_TAG], revalidate: 30 },
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token ?? ''}`,
			},
		});

		if (!res) {
			return create(GetAdminDataResponseSchema, {
				Public: {},
				Private: {},
			});
		}

		const body: GetAdminDataResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetAdminDataResponseSchema, {
			Public: {},
			Private: {},
		});
	}
});

export async function getAdminSettings() {
	const token = await getToken();
	return _getAdminSettings(token);
}

export async function createChannel(req: ChannelRecord) {
	const token = await getToken();
	const url = 'http://localhost:8001/api/settings/channel/create';

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(req),
		});

		if (!res) return false;

		if (!res.ok) {
			console.log(res);
			return false;
		}

		// Bust caches for pages/data that rely on admin settings
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/content');
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function createCategory(req: CategoryRecord) {
	const token = await getToken();
	const url = 'http://localhost:8001/api/settings/category/create';
	try {
		// Ensure we serialize using a proper message instance so field names map correctly
		const msg = create(CategoryRecordSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(CategoryRecordSchema, msg),
		});

		if (!res) return false;
		if (!res.ok) {
			console.log(res);
			return false;
		}

		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/content');
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function modifyPublicSubscriptionSettings(
	req: ModifySubscriptionPublicDataRequest
) {
	const token = await getToken();
	const url = 'http://localhost:8001/api/settings/subscription/public';
	console.log(req);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifySubscriptionPublicDataRequestSchema, req),
		});

		if (!res) {
			return create(ModifySubscriptionPublicDataResponseSchema, {
				Error2: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifySubscriptionPublicDataResponse = await res.json();
		// Revalidate subscription settings cache on success-ish responses
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/subscriptions');
		return body;
	} catch (error) {
		console.error(error);
		return create(ModifySubscriptionPublicDataResponseSchema, {
			Error2: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyCmsPublicSettings(req: ModifyCMSPublicDataRequest) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/cms/public';
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyCMSPublicDataRequestSchema, req),
		});

		if (!res) {
			return create(ModifyCMSPublicDataResponseSchema, {
				Error2: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifyCMSPublicDataResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ModifyCMSPublicDataResponseSchema, {
			Error2: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

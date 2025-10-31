'use server';

import { cache } from 'react';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { getSession } from '@/lib/session';
import {
	GetAdminDataResponse,
	GetAdminDataResponseSchema,
	GetOwnerDataResponse,
	GetOwnerDataResponseSchema,
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
	ModifySubscriptionOwnerDataRequest,
	ModifySubscriptionOwnerDataResponseSchema,
	ModifySubscriptionOwnerDataRequestSchema,
	ModifySubscriptionOwnerDataResponse,
	ModifyEventPublicSettingsRequest,
	ModifyEventPublicSettingsRequestSchema,
	ModifyEventPublicSettingsResponseSchema,
	ModifyEventPublicSettingsResponse,
	ModifyEventPrivateSettingsRequest,
	ModifyEventPrivateSettingsRequestSchema,
	ModifyEventPrivateSettingsResponse,
	ModifyEventPrivateSettingsResponseSchema,
	ModifyEventOwnerSettingsRequest,
	ModifyEventOwnerSettingsRequestSchema,
	ModifyEventOwnerSettingsResponseSchema,
	ModifyEventOwnerSettingsResponse,
	ModifyNotificationOwnerDataRequest,
	ModifyNotificationOwnerDataRequestSchema,
	ModifyNotificationOwnerDataResponse,
	ModifyNotificationOwnerDataResponseSchema,
} from '@inverted-tech/fragments/Settings';

async function getToken() {
	const session = await getSession();
	return session.token;
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
		console.log(body.Public?.Events);
		return body;
	} catch (error) {
		console.error(error);
		return create(GetAdminDataResponseSchema, {
			Public: {},
			Private: {},
		});
	}
});

const _getOwnerSettings = cache(async (token?: string) => {
	const url = 'http://localhost:8001/api/settings/owner';
	try {
		const res = await fetch(url, {
			method: 'GET',
			next: { tags: [ADMIN_SETTINGS_TAG], revalidate: 30 },
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token ?? ''}`,
			},
		});

		if (!res) {
			return create(GetOwnerDataResponseSchema, {
				Public: {},
				Private: {},
			});
		}

		const body: GetOwnerDataResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetOwnerDataResponseSchema, {
			Public: {},
			Private: {},
		});
	}
});

export async function getAdminSettings() {
	const session = await getSession();
	const token = session.token;
	const roles = session.roles ?? [];
	if (roles.includes('owner')) {
		const owner = await _getOwnerSettings(token);
		// Normalize to the admin response shape for callers expecting { Public, Private }
		return create(GetAdminDataResponseSchema, {
			Public: owner?.Public ?? {},
			Private: owner?.Private ?? {},
		});
	}
	return _getAdminSettings(token);
}

export async function getOwnerSettings() {
	const token = await getToken();
	return _getOwnerSettings(token);
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
				Error: create(SettingsErrorSchema, {
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
			Error: create(SettingsErrorSchema, {
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
				Error: create(SettingsErrorSchema, {
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
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyOwnerSubscriptionSettings(
	req: ModifySubscriptionOwnerDataRequest
) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/cms/public';
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifySubscriptionOwnerDataRequestSchema, req),
		});

		if (!res) {
			return create(ModifySubscriptionOwnerDataResponseSchema, {
				Error: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifySubscriptionOwnerDataResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ModifySubscriptionOwnerDataResponseSchema, {
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyNotificationsOwnerSettings(
	req: ModifyNotificationOwnerDataRequest
) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/notifications/owner';
		const msg = create(ModifyNotificationOwnerDataRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyNotificationOwnerDataRequestSchema, msg),
		});

		if (!res) {
			return create(ModifyNotificationOwnerDataResponseSchema, {
				Error: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifyNotificationOwnerDataResponse = await res.json();
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/notifications');
		return body;
	} catch (error) {
		return create(ModifyNotificationOwnerDataResponseSchema, {
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyEventsPublicSettings(
	req: ModifyEventPublicSettingsRequest
) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/events/public';

		// Sanitize any foreign/server-managed fields to avoid ForeignFieldError
		const dropMeta = (o: any) => {
			if (!o || typeof o !== 'object') return o;
			const { $typeName, ...rest } = o as any;
			return rest;
		};
		const sanitized: ModifyEventPublicSettingsRequest = {
			...dropMeta(req as any),
			Data: req?.Data
				? {
						...dropMeta(req.Data as any),
						TicketClasses: Array.isArray((req.Data as any)?.TicketClasses)
							? (req.Data as any).TicketClasses.map((tc: any) => {
									const { TicketClassId, ...rest } = dropMeta(tc ?? {});
									return dropMeta(rest);
							  })
							: undefined,
				  }
				: undefined,
		} as any;

		// Ensure we serialize using a proper message instance so field names map correctly
		const msg = create(
			ModifyEventPublicSettingsRequestSchema,
			sanitized as any
		);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyEventPublicSettingsRequestSchema, msg),
		});

		if (!res) {
			return create(ModifyEventPublicSettingsResponseSchema, {
				Error: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifyEventPublicSettingsResponse = await res.json();
		// Bust caches so refreshed page reads latest settings
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/events');
		return body;
	} catch (error) {
		console.error('[actions] modifyEventsPublicSettings error', error);
		return create(ModifyEventPublicSettingsResponseSchema, {
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyEventsPrivateSettings(
	req: ModifyEventPrivateSettingsRequest
) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/events/private';
		const msg = create(ModifyEventPrivateSettingsRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyEventPrivateSettingsRequestSchema, msg),
		});

		if (!res) {
			return create(ModifyEventPrivateSettingsResponseSchema, {
				Error: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifyEventPrivateSettingsResponse = await res.json();
		// Bust caches so refreshed page reads latest settings
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/events');
		return body;
	} catch (error) {
		return create(ModifyEventPrivateSettingsResponseSchema, {
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

export async function modifyEventsOwnerSettings(
	req: ModifyEventOwnerSettingsRequest
) {
	try {
		const token = await getToken();
		const url = 'http://localhost:8001/api/settings/events/owner';
		const msg = create(ModifyEventOwnerSettingsRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: toJsonString(ModifyEventOwnerSettingsRequestSchema, msg),
		});

		if (!res) {
			return create(ModifyEventOwnerSettingsResponseSchema, {
				Error: create(SettingsErrorSchema, {
					Message: 'Unknown Error',
					Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
				}),
			});
		}

		const body: ModifyEventOwnerSettingsResponse = await res.json();
		// Bust caches so refreshed page reads latest settings
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/events');
		return body;
	} catch (error) {
		return create(ModifyEventOwnerSettingsResponseSchema, {
			Error: create(SettingsErrorSchema, {
				Message: 'Unknown Error',
				Type: SettingsErrorReason.SETTINGS_ERROR_UNKNOWN,
			}),
		});
	}
}

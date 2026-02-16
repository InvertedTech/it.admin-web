'use server';

import { cache } from 'react';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { authHeaders } from '@/lib/cookies';
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
	GetPublicDataResponseSchema,
	GetPublicDataResponse,
} from '@inverted-tech/fragments/Settings';

const ADMIN_SETTINGS_TAG = 'admin-settings';
const API_BASE_URL = process.env.API_BASE_URL!;

const _getAdminSettings = cache(async () => {
	const url = `${API_BASE_URL}/settings/admin`;
	try {
		const res = await fetch(url, {
			method: 'GET',
			next: { tags: [ADMIN_SETTINGS_TAG], revalidate: 30 },
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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

const _getOwnerSettings = cache(async () => {
	const url = `${API_BASE_URL}/settings/owner`;
	try {
		const res = await fetch(url, {
			method: 'GET',
			next: { tags: [ADMIN_SETTINGS_TAG], revalidate: 30 },
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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

export async function getPublicSettings() {
	try {
		const url = `${API_BASE_URL}/settings/public`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
			},
		});

		const body: GetPublicDataResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(GetPublicDataResponseSchema, {
			Public: {},
		});
	}
}

export async function getAdminSettings() {
	return _getAdminSettings();
}

export async function getOwnerSettings() {
	return _getOwnerSettings();
}

export async function createChannel(req: ChannelRecord) {
	const url = `${API_BASE_URL}/settings/channel/create`;

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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

export async function getChannels() {
	try {
		const url = `${API_BASE_URL}/settings/channel`;
		const res = await fetch(url, {
			method: 'GET',
			headers: { ...(await authHeaders()) },
		});

		const body: ChannelRecord[] = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function createCategory(req: CategoryRecord) {
	const url = `${API_BASE_URL}/settings/category/create`;
	try {
		// Ensure we serialize using a proper message instance so field names map correctly
		const msg = create(CategoryRecordSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
	req: ModifySubscriptionPublicDataRequest,
) {
	const url = `${API_BASE_URL}/settings/subscription/public`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
		const url = `${API_BASE_URL}/settings/cms/public`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/content');
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
	req: ModifySubscriptionOwnerDataRequest,
) {
	try {
		const url = `${API_BASE_URL}/settings/cms/public`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
		revalidateTag(ADMIN_SETTINGS_TAG);
		revalidatePath('/settings/subscriptions');
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
	req: ModifyNotificationOwnerDataRequest,
) {
	try {
		const url = `${API_BASE_URL}/settings/notifications/owner`;
		const msg = create(ModifyNotificationOwnerDataRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
	req: ModifyEventPublicSettingsRequest,
) {
	try {
		const url = `${API_BASE_URL}/settings/events/public`;

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
			sanitized as any,
		);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
	req: ModifyEventPrivateSettingsRequest,
) {
	try {
		const url = `${API_BASE_URL}/settings/events/private`;
		const msg = create(ModifyEventPrivateSettingsRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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
	req: ModifyEventOwnerSettingsRequest,
) {
	try {
		const url = `${API_BASE_URL}/settings/events/owner`;
		const msg = create(ModifyEventOwnerSettingsRequestSchema, req as any);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(await authHeaders()),
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

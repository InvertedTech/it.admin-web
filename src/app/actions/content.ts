'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { isoDate, isoTime, tsToDate, type Item } from '@/lib/utils';
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
	ModifyContentRequest,
	ModifyContentResponseSchema,
	ModifyContentRequestSchema,
	ModifyContentResponse,
	GetAllContentAdminRequest,
	GetAllContentAdminRequestSchema,
} from '@inverted-tech/fragments/Content';
import { APIErrorReason, APIErrorSchema } from '@inverted-tech/fragments';

const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}/cms/admin/content`;

export async function createContent(req: CreateContentRequest) {
	try {
		const res = await fetch(API_BASE, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: toJsonString(CreateContentRequestSchema, req),
		});

		if (!res) {
			return create(CreateContentResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_SERVICE_UNAVAILABLE,
					Message: 'Server Unavailible',
				}),
			});
		}

		const body: CreateContentResponse = await res.json();
		if (!body) {
			return create(CreateContentResponseSchema, {
				Error: create(APIErrorSchema, {
					Reason: APIErrorReason.ERROR_REASON_DELIVERY_FAILED,
					Message: 'Server Did Not Send A Response',
				}),
			});
		}

		return body;
	} catch (error) {
		console.error('Create Content Error: ', error);
		return create(CreateContentResponseSchema, {
			Error: create(APIErrorSchema, {
				Reason: APIErrorReason.ERROR_REASON_PROVIDER_ERROR,
				Message: 'Server Error, Check Logs For Create Content',
			}),
		});
	}
}

export async function getContent() {
	try {
		const head: HeadersInit = {
		};
		const res = await fetch(API_BASE, {
			headers: head,
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

// TODO: Replace getContentCalls with getAllContent
export async function getAllContent(req: GetAllContentAdminRequest) {
	try {
		const head: HeadersInit = {
		};
		let url = new URL(`${API_BASE}`);

		if (req.CategoryId)
			url.searchParams.append('CategoryId', req.CategoryId);

		if (req.ChannelId) url.searchParams.append('ChannelId', req.ChannelId);
		if (req.ContentType) {
			url.searchParams.append('ContentType', req.ContentType.toString());
		}

		if (req.PageOffset) {
			url.searchParams.append('PageOffset', req.PageOffset.toString());
		} else {
			url.searchParams.append('PageOffset', '0');
		}

		if (req.PageSize) {
			url.searchParams.append('PageSize', req.PageSize.toString());
		} else {
			url.searchParams.append('PageSize', '10');
		}

		if (req.SubscriptionSearch?.MinimumLevel) {
			url.searchParams.append(
				'SubscriptionSearch.MinimumLevel',
				req.SubscriptionSearch.MinimumLevel.toString(),
			);
		} else {
			url.searchParams.append('SubscriptionSearch.MinimumLevel', '0');
		}

		if (req.SubscriptionSearch?.MaximumLevel) {
			url.searchParams.append(
				'SubscriptionSearch.MaximumLevel',
				req.SubscriptionSearch.MaximumLevel.toString(),
			);
		} else {
			url.searchParams.append('SubscriptionSearch.MaximumLevel', '9999');
		}

		const res = await fetch(url, {
			headers: head,
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

export async function adminSearchContent(
	req: GetAllContentAdminRequest,
): Promise<GetAllContentAdminResponse> {
	try {
		const head: HeadersInit = {
		};
		const url = new URL(`${API_BASE}`);

		if (req.CategoryId)
			url.searchParams.append('CategoryId', req.CategoryId);
		if (req.ChannelId) url.searchParams.append('ChannelId', req.ChannelId);
		if (req.ContentType) {
			url.searchParams.append('ContentType', req.ContentType.toString());
		}

		url.searchParams.append('PageOffset', (req.PageOffset ?? 0).toString());
		url.searchParams.append('PageSize', (req.PageSize ?? 10).toString());

		const minLevel = req.SubscriptionSearch?.MinimumLevel ?? 0;
		const maxLevel = req.SubscriptionSearch?.MaximumLevel ?? 9999;
		url.searchParams.append(
			'SubscriptionSearch.MinimumLevel',
			String(minLevel),
		);
		url.searchParams.append(
			'SubscriptionSearch.MaximumLevel',
			String(maxLevel),
		);

		const res = await fetch(url, {
			headers: head,
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
		const res = await fetch(API_BASE.concat(`/${contentId}`), {
			headers: {
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

// TODO: Add Error.proto errors
export async function publishContent(req: PublishContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/publish`);
		const bodyJson = toJsonString(PublishContentRequestSchema, req);
		try {
			console.log('[publishContent] request', {
				url,
				contentId: (req as any)?.ContentID,
				body: bodyJson,
			});
		} catch {}

		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: bodyJson,
		});

		if (!res) {
			console.log('[publishContent] no response received');
			return create(PublishContentResponseSchema);
		}

		const status = res.status;
		const text = await res.text().catch(() => '');
		try {
			console.log('[publishContent] response', { status, body: text });
		} catch {}

		let body: PublishContentResponse;
		try {
			body = text
				? (JSON.parse(text) as PublishContentResponse)
				: create(PublishContentResponseSchema);
		} catch (e) {
			console.error('[publishContent] failed to parse response JSON', e);
			body = create(PublishContentResponseSchema);
		}

		return body;
	} catch (error) {
		console.error('[publishContent] error', error);
		return create(PublishContentResponseSchema);
	}
}

// TODO: Add Error.proto errors
export async function unpublishContent(req: UnpublishContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/unpublish`);
		const res = await fetch(url, {
			headers: {
			},
			method: 'POST',
			body: toJsonString(UnpublishContentRequestSchema, req),
		});
		console.log(res);
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

// TODO: Add Error.proto errors
export async function announceContent(req: AnnounceContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/announce`);
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
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

// TODO: Add Error.proto errors
export async function unannounceContent(req: UnannounceContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/unannounce`);
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
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

// TODO: Add Error.proto errors
export async function deleteContent(req: DeleteContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/delete`);
		const res = await fetch(url, {
			headers: {
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

// TODO: Add Error.proto errors
export async function undeleteContent(req: UndeleteContentRequest) {
	try {
		const url = API_BASE.concat(`/${req.ContentID}/undelete`);
		const res = await fetch(url, {
			headers: {
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

// Dashboard event helpers (publish + announcement)

export type DashboardContentEvent = {
	id: string;
	title: string;
	date: string; // YYYY-MM-DD
	time?: string; // HH:mm
	type: 'publish' | 'announcement' | 'created';
	url?: string;
};

// TODO: Pass req in as args
export async function getCalendarEvents(args: {
	ym: string;
	type?: 'publish' | 'announcement' | 'all';
}): Promise<DashboardContentEvent[]> {
	const { ym, type = 'all' } = args;
	const list = await getContent();
	const records = (list as any)?.Records ?? [];

	const events: DashboardContentEvent[] = [];
	for (const r of records) {
		const title: string = r?.Title ?? 'Untitled';
		const id: string = r?.ContentID ?? '';

		const p = tsToDate(r?.PublishOnUTC);
		if (
			p &&
			isoDate(p).startsWith(ym) &&
			(type === 'all' || type === 'publish')
		) {
			events.push({
				id: `${id}-pub`,
				title,
				date: isoDate(p),
				time: isoTime(p),
				type: 'publish',
				url: `/content/${id}`,
			});
		}

		const a = tsToDate(r?.AnnounceOnUTC);
		if (
			a &&
			isoDate(a).startsWith(ym) &&
			(type === 'all' || type === 'announcement')
		) {
			events.push({
				id: `${id}-ann`,
				title,
				date: isoDate(a),
				time: isoTime(a),
				type: 'announcement',
				url: `/content/${id}`,
			});
		}
	}

	events.sort((x, y) =>
		(x.date + (x.time ?? '')).localeCompare(y.date + (y.time ?? '')),
	);
	return events;
}

// TODO: Pass req in as args
export async function getWeekEvents(args?: {
	startDate?: string;
}): Promise<DashboardContentEvent[]> {
	const start = args?.startDate ? new Date(args.startDate) : new Date();
	const weekStart = new Date(start);
	weekStart.setHours(0, 0, 0, 0);
	weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekEnd.getDate() + 6);

	function inWeek(d: Date) {
		const x = new Date(d);
		x.setHours(0, 0, 0, 0);
		return x >= weekStart && x <= weekEnd;
	}

	const list = await adminSearchContent(
		create(GetAllContentAdminRequestSchema, {
			PageSize: 200,
			PageOffset: 0,
			SubscriptionSearch: {
				MinimumLevel: 0,
				MaximumLevel: 9999,
			},
		}),
	);
	const records = (list as any)?.Records ?? [];
	const events: DashboardContentEvent[] = [];

	const pickDate = (r: any, keys: string[]) => {
		for (const key of keys) {
			const v = r?.[key];
			const d = tsToDate(v);
			if (d) return d;
		}
		return undefined;
	};

	for (const r of records) {
		const title: string = r?.Title ?? 'Untitled';
		const id: string = r?.ContentID ?? '';

		// console.log('[getWeekEvents] record dates', {
		// 	id,
		// 	title,
		// 	PublishOnUTC: r?.PublishOnUTC,
		// 	PublishOnUtc: r?.PublishOnUtc,
		// 	publishOnUtc: r?.publishOnUtc,
		// 	AnnounceOnUTC: r?.AnnounceOnUTC,
		// 	AnnounceOnUtc: r?.AnnounceOnUtc,
		// 	announceOnUtc: r?.announceOnUtc,
		// 	CreatedOnUTC: r?.CreatedOnUTC,
		// 	CreatedOnUtc: r?.CreatedOnUtc,
		// 	createdOnUtc: r?.createdOnUtc,
		// });

		const p = pickDate(r, [
			'PublishOnUTC',
			'PublishOnUtc',
			'publishOnUtc',
			'publishOnUTC',
		]);
		if (p && inWeek(p)) {
			events.push({
				id: `${id}-pub`,
				title,
				date: isoDate(p),
				time: isoTime(p),
				type: 'publish',
				url: `/content/${id}`,
			});
		}

		const a = pickDate(r, [
			'AnnounceOnUTC',
			'AnnounceOnUtc',
			'announceOnUtc',
			'announceOnUTC',
		]);
		if (a && inWeek(a)) {
			events.push({
				id: `${id}-ann`,
				title,
				date: isoDate(a),
				time: isoTime(a),
				type: 'announcement',
				url: `/content/${id}`,
			});
		}

		if (!p && !a) {
			const c = pickDate(r, [
				'CreatedOnUTC',
				'CreatedOnUtc',
				'createdOnUtc',
				'createdOnUTC',
			]);
			if (c && inWeek(c)) {
				events.push({
					id: `${id}-created`,
					title,
					date: isoDate(c),
					time: isoTime(c),
					type: 'created',
					url: `/content/${id}`,
				});
			}
		}
	}

	events.sort((x, y) =>
		(x.date + (x.time ?? '')).localeCompare(y.date + (y.time ?? '')),
	);
	return events;
}

// Overview activity (drafts, scheduled, recent) + stats
function relLabel(d?: Date): string {
	if (!d) return '';
	const now = new Date();
	const sameDay =
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate();
	if (sameDay) return 'Today';
	return d.toLocaleString();
}

// TODO: Pass req in as args
export async function getOverviewActivity(args?: {
	rangeDays?: number;
	limitDrafts?: number;
	limitScheduled?: number;
	limitRecent?: number;
}): Promise<{
	drafts: Item[];
	scheduled: Item[];
	recent: Item[];
	stats: {
		total: number;
		published: number;
		drafts: number;
		scheduled: number;
		pendingComments: number;
		assets: number;
	};
}> {
	const rangeDays = args?.rangeDays ?? 90;
	const limD = args?.limitDrafts ?? 5;
	const limS = args?.limitScheduled ?? 5;
	const limR = args?.limitRecent ?? 5;

	const list = await getContent();
	const records = ((list as any)?.Records ?? []) as any[];
	const now = new Date();
	const since = new Date(now);
	since.setDate(now.getDate() - rangeDays);

	const toItem = (r: any, status: Item['status'], when?: Date): Item => ({
		id: String(r?.ContentID ?? ''),
		title: String(r?.Title ?? 'Untitled'),
		status,
		date: relLabel(when),
		author: String(r?.Author ?? '—'),
	});

	let draftCount = 0;
	let publishCount = 0;
	let scheduledCount = 0;

	const drafts: Item[] = [];
	const scheduled: Item[] = [];
	const recent: Item[] = [];

	for (const r of records) {
		const pub = tsToDate((r as any)?.PublishOnUTC);
		if (!pub) {
			draftCount++;
			if (drafts.length < limD)
				drafts.push(
					toItem(r, 'draft', tsToDate((r as any)?.CreatedOnUTC)),
				);
			continue;
		}
		if (pub > now) {
			scheduledCount++;
			if (scheduled.length < limS)
				scheduled.push(toItem(r, 'scheduled', pub));
			continue;
		}
		// published in the past
		publishCount++;
		if (pub >= since && recent.length < limR)
			recent.push(toItem(r, 'published', pub));
	}

	// Sort lists
	drafts.sort((a, b) => String(a.title).localeCompare(b.title));
	scheduled.sort((a, b) => String(a.date).localeCompare(b.date));
	recent.sort((a, b) => String(b.date).localeCompare(a.date));

	const stats = {
		total: Number(records.length || 0),
		published: publishCount,
		drafts: draftCount,
		scheduled: scheduledCount,
		pendingComments: 0,
		assets: 0,
	} as const;

	return { drafts, scheduled, recent, stats: { ...stats } };
}

// TODO: Add Error.proto errors
export async function modifyContent(req: ModifyContentRequest) {
	try {
			return create(ModifyContentResponseSchema, {});
		const url = API_BASE_URL.concat(`/cms/admin/content/${req.ContentID}`);
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: toJsonString(ModifyContentRequestSchema, req),
		});

		if (!res || !res.ok) {
			console.log('not okay server action', res);
			return create(ModifyContentResponseSchema, {});
		}

		const body: ModifyContentResponse = await res.json();
		return body;
	} catch (error) {
		console.error(error);
		return create(ModifyContentResponseSchema, {});
	}
}



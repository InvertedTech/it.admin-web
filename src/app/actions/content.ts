'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { create, toJsonString } from '@bufbuild/protobuf';
import { getSession } from '@/lib/session';
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
} from '@inverted-tech/fragments/Content';
async function getToken() {
	const session = await getSession();
	return session.token;
}

const ADMIN_CONTENT_TAG = 'admin-content';
const API_BASE_URL = process.env.API_BASE_URL!;
const API_BASE = `${API_BASE_URL}/cms/admin/content`;

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

		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
		} catch {}
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
		const head: HeadersInit = {
			Authorization: `Bearer ${token}`,
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

export async function adminGetContent(contentId: string) {
	try {
		const token = await getToken();
		const res = await fetch(API_BASE.concat(`/${contentId}`), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: 'GET',
			next: { tags: [ADMIN_CONTENT_TAG], revalidate: 30 },
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
				Authorization: `Bearer ${token}`,
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
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
		return body;
	} catch (error) {
		console.error('[publishContent] error', error);
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
		console.log(res);
		if (!res) {
			return create(UnpublishContentResponseSchema);
		}

		const body: UnpublishContentResponse = await res.json();
		console.log(body);
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
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
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
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
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
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
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
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
		try {
			revalidateTag(ADMIN_CONTENT_TAG);
			revalidatePath('/content');
			revalidatePath('/content/all');
			if ((req as any)?.ContentID)
				revalidatePath(`/content/${(req as any).ContentID}`);
		} catch {}
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
	type: 'publish' | 'announcement';
	url?: string;
};

// Returns concatenated publish + announcement events for a given year-month (YYYY-MM)
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

// Returns concatenated publish + announcement events for the week containing startDate (ISO YYYY-MM-DD)
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

	const list = await getContent();
	const records = (list as any)?.Records ?? [];
	const events: DashboardContentEvent[] = [];
	for (const r of records) {
		const title: string = r?.Title ?? 'Untitled';
		const id: string = r?.ContentID ?? '';

		const p = tsToDate(r?.PublishOnUTC);
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

		const a = tsToDate(r?.AnnounceOnUTC);
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

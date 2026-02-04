import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type Item = {
	id: string;
	title: string;
	status: 'draft' | 'scheduled' | 'published';
	date: string;
	author: string;
};

export type ContentEvent = {
	id: string;
	title: string;
	date: string; // YYYY-MM-DD
	time?: string; // HH:mm
	type: 'publish' | 'announcement';
	url?: string;
};

export type CalMonthInfo = { year: number; month: number; label: string };
export type CalMonthCell = {
	key: string;
	date: Date;
	iso: string;
	inMonth: boolean;
};

export function calIsoDate(d: Date) {
	return d.toISOString().slice(0, 10);
}
export function calIsoYM(d: Date) {
	return d.toISOString().slice(0, 7);
}

export function calParseYM(ym: string): CalMonthInfo {
	const [y, m] = ym.split('-').map(Number);
	return {
		year: y,
		month: m - 1,
		label: new Date(y, m - 1, 1).toLocaleString(undefined, {
			month: 'long',
			year: 'numeric',
		}),
	};
}

export function calShiftYM(ym: string, delta: number) {
	const [y, m] = ym.split('-').map(Number);
	return calIsoYM(new Date(y, m - 1 + delta, 1));
}

export function calIsToday(d: Date) {
	const t = new Date();
	return (
		d.getFullYear() === t.getFullYear() &&
		d.getMonth() === t.getMonth() &&
		d.getDate() === t.getDate()
	);
}

export function calBuildMonthGrid(mi: CalMonthInfo): CalMonthCell[][] {
	const first = new Date(mi.year, mi.month, 1);
	const start = new Date(first);
	start.setDate(first.getDate() - first.getDay());
	const weeks: CalMonthCell[][] = [];
	for (let w = 0; w < 6; w++) {
		const row: CalMonthCell[] = [];
		for (let d = 0; d < 7; d++) {
			const dt = new Date(start);
			dt.setDate(start.getDate() + w * 7 + d);
			row.push({
				key: dt.toISOString(),
				date: dt,
				iso: calIsoDate(dt),
				inMonth: dt.getMonth() === mi.month,
			});
		}
		weeks.push(row);
	}
	return weeks;
}

export function calGroupEventsByDay(events: ContentEvent[]) {
	return events.reduce<Record<string, ContentEvent[]>>((acc, e) => {
		(acc[e.date] ||= []).push(e);
		return acc;
	}, {});
}

export type MaybeTimestamp = unknown;

export function tsToDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		'toDate' in (value as any) &&
		typeof (value as any).toDate === 'function'
	) {
		try {
			const d = (value as any).toDate();
			if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
		} catch {}
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		'seconds' in (value as any)
	) {
		const seconds = (value as any).seconds as unknown;
		const nanos = (value as any).nanos as unknown;
		const sNum =
			typeof seconds === 'string'
				? Number(seconds)
				: typeof seconds === 'number'
					? seconds
					: typeof seconds === 'bigint'
						? Number(seconds)
						: undefined;
		const nNum =
			typeof nanos === 'string'
				? Number(nanos)
				: typeof nanos === 'number'
					? nanos
					: typeof nanos === 'bigint'
						? Number(nanos)
						: 0;
		if (typeof sNum === 'number' && Number.isFinite(sNum)) {
			const millis = sNum * 1000 + Math.floor(nNum / 1_000_000);
			const d = new Date(millis);
			return Number.isNaN(d.getTime()) ? undefined : d;
		}
	}
	return undefined;
}

export function isoDate(d: Date) {
	return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function isoTime(d?: Date) {
	if (!d) return undefined;
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${hh}:${mm}`;
}

export function toIso(v: unknown): string | undefined {
	if (!v) return;
	if (typeof v === 'string') return v;
	if (v instanceof Date) return v.toISOString();
	if (typeof v === 'object' && v && 'seconds' in (v as any)) {
		const sec = (v as any).seconds as number | bigint | string;
		const s = typeof sec === 'bigint' ? Number(sec) : Number(sec ?? 0);
		const n = Number((v as any).nanos ?? 0);
		const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
		return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
	}
}

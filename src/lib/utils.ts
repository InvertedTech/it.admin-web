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

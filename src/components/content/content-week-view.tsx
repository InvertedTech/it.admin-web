// src/components/content/ContentWeekView.tsx
'use client';

import { useMemo } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarDays, Megaphone, Eye } from 'lucide-react';

// Reuse your existing type if exported elsewhere
export type ContentEvent = {
	id: string;
	title: string;
	date: string; // ISO yyyy-mm-dd
	time?: string; // '14:00'
	type: 'publish' | 'announcement';
	url?: string;
};

export function ContentWeekView({
	startDate, // ISO day inside the target week; defaults to today
	events,
	title = 'This week',
	description = 'Announcements and publish dates',
}: {
	startDate?: string;
	events?: ContentEvent[];
	title?: string;
	description?: string;
}) {
	const start = useMemo(
		() => startOfWeek(startDate ? new Date(startDate) : new Date()),
		[startDate]
	);
	const days = useMemo(() => range7(start), [start]);
	const byDay = useMemo(() => groupByDay(events ?? []), [events]);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<div className="grid min-w-[720px] grid-cols-7 gap-px rounded-md border bg-border">
						{days.map((d) => {
							const iso = isoDate(d);
							const list = (byDay[iso] ?? []).slice(0, 4);
							return (
								<div
									key={iso}
									className={cn('bg-background p-2', 'min-h-[120px]')}
								>
									<div className="mb-2 flex items-center justify-between text-xs">
										<div className="font-medium">
											{d.toLocaleDateString(undefined, { weekday: 'short' })}
										</div>
										<div
											className={cn(
												'tabular-nums rounded px-1',
												isToday(d)
													? 'bg-primary text-primary-foreground'
													: 'text-muted-foreground'
											)}
										>
											{d.getDate()}
										</div>
									</div>

									<div className="space-y-1">
										{list.map((ev) => (
											<EventPill
												key={ev.id}
												ev={ev}
											/>
										))}
										{(byDay[iso]?.length ?? 0) > 4 && (
											<span className="block text-[10px] text-muted-foreground">
												+{(byDay[iso]?.length ?? 0) - 4} more
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

/* --- pill --- */
function EventPill({ ev }: { ev: ContentEvent }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					className={cn(
						'w-full truncate rounded px-2 py-1 text-left text-[11px] ring-1',
						ev.type === 'publish'
							? 'bg-emerald-500/10 ring-emerald-500/30 hover:bg-emerald-500/15'
							: 'bg-sky-500/10 ring-sky-500/30 hover:bg-sky-500/15'
					)}
					title={ev.title}
				>
					<span className="inline-flex items-center gap-1">
						{ev.type === 'publish' ? (
							<CalendarDays className="h-3 w-3" />
						) : (
							<Megaphone className="h-3 w-3" />
						)}
						{ev.title}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80 text-sm">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="font-medium">{ev.title}</div>
						<Badge
							variant={ev.type === 'publish' ? 'default' : 'secondary'}
							className="capitalize"
						>
							{ev.type}
						</Badge>
					</div>
					<div className="grid grid-cols-3 gap-2 text-xs">
						<div className="text-muted-foreground">Date</div>
						<div className="col-span-2">
							{ev.date}
							{ev.time ? ` • ${ev.time}` : ''}
						</div>
						{ev.url && (
							<>
								<div className="text-muted-foreground">Link</div>
								<div className="col-span-2">
									<a
										className="underline underline-offset-2"
										href={ev.url}
										target="_blank"
										rel="noreferrer"
									>
										Open <Eye className="ml-1 inline h-3 w-3" />
									</a>
								</div>
							</>
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

/* --- utils --- */
function startOfWeek(d: Date) {
	const x = new Date(d);
	const day = x.getDay(); // Sunday start
	x.setHours(0, 0, 0, 0);
	x.setDate(x.getDate() - day);
	return x;
}
function range7(start: Date) {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		return d;
	});
}
function isoDate(d: Date) {
	return d.toISOString().slice(0, 10);
}
function isToday(d: Date) {
	const t = new Date();
	return (
		d.getFullYear() === t.getFullYear() &&
		d.getMonth() === t.getMonth() &&
		d.getDate() === t.getDate()
	);
}
function groupByDay(events: ContentEvent[]) {
	return events.reduce<Record<string, ContentEvent[]>>((acc, e) => {
		(acc[e.date] ||= []).push(e);
		return acc;
	}, {});
}

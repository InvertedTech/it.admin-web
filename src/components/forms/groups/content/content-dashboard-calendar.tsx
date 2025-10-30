'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
	calBuildMonthGrid,
	calGroupEventsByDay,
	calIsoYM,
	calIsToday,
	CalMonthCell,
	calParseYM,
	calShiftYM,
	cn,
	ContentEvent,
} from '@/lib/utils';
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Eye,
	Megaphone,
} from 'lucide-react';
import { calDemoEvents } from './content-dashboard-overview';

export function CalendarSection({
    initialMonth,
    events,
}: {
    initialMonth?: string;
    events?: ContentEvent[];
}) {
    const [ym, setYm] = useState(initialMonth ?? calIsoYM(new Date()));
    const [filter, setFilter] = useState<'all' | 'publish' | 'announcement'>(
        'all'
    );
    const [data, setData] = useState<ContentEvent[] | undefined>(events);

    const month = useMemo(() => calParseYM(ym), [ym]);
    const grid = useMemo(() => calBuildMonthGrid(month), [month]);

    // Fetch events for the visible month when navigating
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch(`/api/admin/content/calendar?ym=${ym}`, {
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Failed to load events');
                const body = (await res.json()) as ContentEvent[];
                if (!cancelled) setData(body);
            } catch {
                // Preserve existing data or fall back to initial/demos
                if (!cancelled)
                    setData((cur) => (cur && cur.length ? cur : events ?? calDemoEvents));
            }
        }
        // Always fetch to stay in sync with server filters
        load();
        return () => {
            cancelled = true;
        };
    }, [ym]);

    const dataOrDemo = data ?? calDemoEvents;
    const filtered = useMemo(
        () =>
            dataOrDemo.filter(
                (e) =>
                    e.date.startsWith(ym) &&
                    (filter === 'all' || e.type === filter)
            ),
        [dataOrDemo, ym, filter]
    );

	return (
		<div className='space-y-6'>
			<CalendarHeader
				ym={ym}
				onPrev={() => setYm(calShiftYM(ym, -1))}
				onNext={() => setYm(calShiftYM(ym, 1))}
				onToday={() => setYm(calIsoYM(new Date()))}
			/>

			<Card>
				<CardHeader className='space-y-2'>
					<div className='flex items-center justify-between gap-2'>
						<div>
							<CardTitle>{month.label}</CardTitle>
							<CardDescription>
								Announcements and publish dates
							</CardDescription>
						</div>
						<CalendarLegend filter={filter} setFilter={setFilter} />
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<CalendarMonthGrid grid={grid} events={filtered} />
						<Separator />
						<CalendarAgenda events={filtered} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/* internal bits */

function CalendarHeader({
	ym,
	onPrev,
	onNext,
	onToday,
}: {
	ym: string;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
}) {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h2 className='text-xl font-semibold tracking-tight'>
					Content Calendar
				</h2>
				<p className='text-sm text-muted-foreground'>
					Plan announcements and publishes.
				</p>
			</div>
			<div className='flex items-center gap-2'>
				<Button variant='outline' size='icon' onClick={onPrev}>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				<div className='w-[120px] text-center text-sm tabular-nums'>
					{ym}
				</div>
				<Button variant='outline' size='icon' onClick={onNext}>
					<ChevronRight className='h-4 w-4' />
				</Button>
				<Button variant='secondary' size='sm' onClick={onToday}>
					Today
				</Button>
			</div>
		</div>
	);
}

function CalendarLegend({
	filter,
	setFilter,
}: {
	filter: 'all' | 'publish' | 'announcement';
	setFilter: (v: any) => void;
}) {
	return (
		<div className='flex items-center gap-2'>
			<Badge
				onClick={() => setFilter('all')}
				variant={filter === 'all' ? 'default' : 'outline'}
				className='cursor-pointer'
			>
				All
			</Badge>
			<Badge
				onClick={() => setFilter('publish')}
				variant={filter === 'publish' ? 'default' : 'outline'}
				className='cursor-pointer'
			>
				Publish
			</Badge>
			<Badge
				onClick={() => setFilter('announcement')}
				variant={filter === 'announcement' ? 'default' : 'outline'}
				className='cursor-pointer'
			>
				Announcement
			</Badge>
		</div>
	);
}

function CalendarMonthGrid({
	grid,
	events,
}: {
	grid: CalMonthCell[][];
	events: ContentEvent[];
}) {
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const byDay = calGroupEventsByDay(events);
	return (
		<div className='space-y-2'>
			<div className='grid grid-cols-7 text-xs text-muted-foreground'>
				{days.map((d) => (
					<div key={d} className='px-2 py-1'>
						{d}
					</div>
				))}
			</div>
			<div className='grid grid-cols-7 gap-px rounded-md border bg-border'>
				{grid.flat().map((cell) => (
					<div
						key={cell.key}
						className={cn(
							'min-h[110px] bg-background p-2',
							!cell.inMonth && 'text-muted-foreground/60'
						)}
					>
						<div className='mb-1 text-xs'>
							<span
								className={cn(
									'tabular-nums',
									calIsToday(cell.date) &&
										'rounded px-1 bg-primary text-primary-foreground'
								)}
							>
								{cell.date.getDate()}
							</span>
						</div>
						<div className='space-y-1'>
							{(byDay[cell.iso] ?? []).slice(0, 3).map((ev) => (
								<CalendarEventPill key={ev.id} ev={ev} />
							))}
							{(byDay[cell.iso] ?? []).length > 3 && (
								<span className='block text-[10px] text-muted-foreground'>
									+{(byDay[cell.iso] ?? []).length - 3} more
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function CalendarEventPill({ ev }: { ev: ContentEvent }) {
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
				>
					<span className='inline-flex items-center gap-1'>
						{ev.type === 'publish' ? (
							<CalendarDays className='h-3 w-3' />
						) : (
							<Megaphone className='h-3 w-3' />
						)}
						{ev.title}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent className='w-80 text-sm'>
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<div className='font-medium'>{ev.title}</div>
						<Badge
							variant={
								ev.type === 'publish' ? 'default' : 'secondary'
							}
							className='capitalize'
						>
							{ev.type}
						</Badge>
					</div>
					<Separator />
					<div className='grid grid-cols-3 gap-2 text-xs'>
						<div className='text-muted-foreground'>Date</div>
						<div className='col-span-2'>
							{ev.date}
							{ev.time ? ` • ${ev.time}` : ''}
						</div>
						{ev.url && (
							<>
								<div className='text-muted-foreground'>
									Link
								</div>
								<div className='col-span-2'>
									<a
										className='underline underline-offset-2'
										href={ev.url}
										target='_blank'
										rel='noreferrer'
									>
										Open{' '}
										<Eye className='ml-1 inline h-3 w-3' />
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

function CalendarAgenda({ events }: { events: ContentEvent[] }) {
	const items = [...events].sort((a, b) => a.date.localeCompare(b.date));
	if (!items.length) return <EmptyState label='No events for this month.' />;
	return (
		<div className='divide-y rounded-md border'>
			{items.map((ev) => (
				<div
					key={ev.id}
					className='flex items-center gap-3 p-3 text-sm'
				>
					<div
						className={cn(
							'h-2 w-2 rounded-full',
							ev.type === 'publish'
								? 'bg-emerald-500'
								: 'bg-sky-500'
						)}
					/>
					<div className='tabular-nums w-[94px] text-muted-foreground'>
						{ev.date.slice(5)}
					</div>
					<div className='min-w-0 flex-1 truncate'>{ev.title}</div>
					<Badge
						variant={
							ev.type === 'publish' ? 'default' : 'secondary'
						}
						className='capitalize'
					>
						{ev.type}
					</Badge>
				</div>
			))}
		</div>
	);
}

function EmptyState({ label }: { label: string }) {
	return (
		<div className='flex h-36 items-center justify-center rounded-md border border-dashed'>
			<p className='text-sm text-muted-foreground'>{label}</p>
		</div>
	);
}

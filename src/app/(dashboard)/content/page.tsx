'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
	Plus,
	Upload,
	Settings,
	Image as ImageIcon,
	FileText,
	CalendarClock,
	MessageSquare,
	Pencil,
	Eye,
	ChevronLeft,
	ChevronRight,
	Megaphone,
	CalendarDays,
} from 'lucide-react';
import { ContentWeekView } from '@/components/content/content-week-view';

const weekEvents: ContentEvent[] = [
	{
		id: '1',
		title: 'Friday Live announcement',
		date: '2025-10-31',
		type: 'announcement',
	},
	{
		id: '2',
		title: 'Feature post',
		date: '2025-10-29',
		time: '10:00',
		type: 'publish',
	},
];

/* ---------- Types ---------- */
type Item = {
	id: string;
	title: string;
	status: 'draft' | 'scheduled' | 'published';
	date: string;
	author: string;
};
export type ContentEvent = {
	id: string;
	title: string;
	date: string;
	time?: string;
	type: 'publish' | 'announcement';
	url?: string;
};

/* ---------- Page ---------- */
export default function ContentPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-tight">Content</h1>
			<p className="text-sm text-muted-foreground">
				Overview, calendar, and quick actions.
			</p>

			<Tabs
				defaultValue="overview"
				className="w-full"
			>
				<TabsList className="justify-start overflow-x-auto">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="mt-6"
				>
					<OverviewSection />
				</TabsContent>

				<TabsContent
					value="calendar"
					className="mt-6"
				>
					<CalendarSection />
				</TabsContent>
			</Tabs>
		</div>
	);
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
	stats,
	drafts,
	scheduled,
	recent,
}: {
	stats?: Partial<{
		total: number;
		published: number;
		drafts: number;
		scheduled: number;
		pendingComments: number;
		assets: number;
	}>;
	drafts?: Item[];
	scheduled?: Item[];
	recent?: Item[];
}) {
	const s = useMemo(
		() => ({
			total: stats?.total ?? 1280,
			published: stats?.published ?? 1012,
			drafts: stats?.drafts ?? 54,
			scheduled: stats?.scheduled ?? 11,
			pendingComments: stats?.pendingComments ?? 23,
			assets: stats?.assets ?? 6421,
		}),
		[stats]
	);

	return (
		<div className="space-y-6">
			<OverviewHeader />

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total"
					value={s.total}
					icon={<FileText className="h-4 w-4" />}
				/>
				<StatCard
					title="Published"
					value={s.published}
					accent="success"
				/>
				<StatCard
					title="Drafts"
					value={s.drafts}
					accent="warning"
				/>
				<StatCard
					title="Scheduled"
					value={s.scheduled}
					icon={<CalendarClock className="h-4 w-4" />}
				/>
			</div>

			<ContentWeekView events={weekEvents} />

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader className="gap-2">
						<CardTitle>Activity</CardTitle>
						<CardDescription>
							Recent drafts, scheduled posts, and updates.
						</CardDescription>
						<OverviewToolbar />
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="drafts">
							<TabsList className="w-full justify-start overflow-x-auto">
								<TabsTrigger value="drafts">Drafts</TabsTrigger>
								<TabsTrigger value="scheduled">Scheduled</TabsTrigger>
								<TabsTrigger value="recent">Recent</TabsTrigger>
							</TabsList>
							<TabsContent
								value="drafts"
								className="mt-4"
							>
								<OverviewList
									items={drafts ?? demoDrafts}
									empty="No drafts found."
								/>
							</TabsContent>
							<TabsContent
								value="scheduled"
								className="mt-4"
							>
								<OverviewList
									items={scheduled ?? demoScheduled}
									empty="Nothing scheduled."
								/>
							</TabsContent>
							<TabsContent
								value="recent"
								className="mt-4"
							>
								<OverviewList
									items={recent ?? demoRecent}
									empty="No recent updates."
								/>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<QuickActions />
					<ContentHealth
						published={s.published}
						total={s.total}
						comments={s.pendingComments}
					/>
					<QuickLinks assets={s.assets} />
				</div>
			</div>
		</div>
	);
}

function OverviewHeader() {
	return (
		<div className="flex items-end justify-between gap-4">
			<div>
				<h2 className="text-xl font-semibold tracking-tight">
					Content Overview
				</h2>
				<p className="text-sm text-muted-foreground">
					Manage posts, assets, and workflow at a glance.
				</p>
			</div>
			<div className="flex gap-2">
				<Button
					size="sm"
					className="gap-2"
				>
					<Plus className="h-4 w-4" /> Create
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
				>
					<Upload className="h-4 w-4" /> Upload asset
				</Button>
			</div>
		</div>
	);
}

function OverviewToolbar() {
	return (
		<div className="flex flex-wrap items-center gap-3 pt-2">
			<div className="flex-1 min-w-[200px]">
				<Label
					htmlFor="search"
					className="sr-only"
				>
					Search
				</Label>
				<Input
					id="search"
					placeholder="Search titles, tags, or IDs"
				/>
			</div>
			<Select defaultValue="all">
				<SelectTrigger className="w-[160px]">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					<SelectItem value="draft">Draft</SelectItem>
					<SelectItem value="scheduled">Scheduled</SelectItem>
					<SelectItem value="published">Published</SelectItem>
				</SelectContent>
			</Select>
			<Select defaultValue="90">
				<SelectTrigger className="w-[140px]">
					<SelectValue placeholder="Range" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="7">7 days</SelectItem>
					<SelectItem value="30">30 days</SelectItem>
					<SelectItem value="90">90 days</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
	accent,
}: {
	title: string;
	value: number | string;
	icon?: React.ReactNode;
	accent?: 'success' | 'warning';
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardDescription className="flex items-center gap-2">
					{icon}
					{title}
				</CardDescription>
				<CardTitle className="text-3xl">{value}</CardTitle>
			</CardHeader>
			<CardContent>
				{accent === 'success' ? (
					<Badge
						variant="secondary"
						className="rounded-full"
					>
						Healthy
					</Badge>
				) : accent === 'warning' ? (
					<Badge
						variant="outline"
						className="rounded-full"
					>
						Action needed
					</Badge>
				) : (
					<div className="h-6" />
				)}
			</CardContent>
		</Card>
	);
}

function OverviewList({ items, empty }: { items: Item[]; empty: string }) {
	if (!items?.length) return <EmptyState label={empty} />;
	return (
		<ScrollArea className="h-[360px] pr-2">
			<ul className="divide-y divide-border">
				{items.map((it) => (
					<li
						key={it.id}
						className="py-3 flex items-start gap-3"
					>
						<div className="mt-1">
							{it.status === 'draft' ? (
								<Pencil className="h-4 w-4 text-muted-foreground" />
							) : it.status === 'scheduled' ? (
								<CalendarClock className="h-4 w-4 text-muted-foreground" />
							) : (
								<Eye className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<span className="truncate font-medium leading-none">
									{it.title}
								</span>
								<Badge
									variant={badgeVariantFor(it.status)}
									className="capitalize"
								>
									{it.status}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{it.author} • {it.date}
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="icon"
							>
								<Pencil className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
							>
								<Eye className="h-4 w-4" />
							</Button>
						</div>
					</li>
				))}
			</ul>
		</ScrollArea>
	);
}

function badgeVariantFor(
	s: Item['status']
): 'default' | 'secondary' | 'outline' {
	switch (s) {
		case 'draft':
			return 'secondary';
		case 'scheduled':
			return 'outline';
		default:
			return 'default';
	}
}

function EmptyState({ label }: { label: string }) {
	return (
		<div className="flex h-36 items-center justify-center rounded-md border border-dashed">
			<p className="text-sm text-muted-foreground">{label}</p>
		</div>
	);
}

function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick actions</CardTitle>
				<CardDescription>Common content tasks.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2">
				<Button className="justify-start gap-2">
					<Plus className="h-4 w-4" /> New post
				</Button>
				<Button
					variant="outline"
					className="justify-start gap-2"
				>
					<Upload className="h-4 w-4" /> Upload asset
				</Button>
				<Button
					variant="ghost"
					className="justify-start gap-2"
				>
					<Settings className="h-4 w-4" /> Content settings
				</Button>
			</CardContent>
		</Card>
	);
}

function ContentHealth({
	published,
	total,
	comments,
}: {
	published: number;
	total: number;
	comments: number;
}) {
	const pct = Math.min(
		100,
		Math.round(((published ?? 0) / Math.max(total, 1)) * 100)
	);
	return (
		<Card>
			<CardHeader>
				<CardTitle>Content health</CardTitle>
				<CardDescription>
					At-a-glance distribution and moderation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<div className="mb-1 flex items-center justify-between text-sm">
						<span>Published ratio</span>
						<span className="text-muted-foreground">{pct}%</span>
					</div>
					<Progress value={pct} />
				</div>
				<Separator />
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-4 w-4" /> Pending comments
					</div>
					<Badge variant="secondary">{comments}</Badge>
				</div>
			</CardContent>
		</Card>
	);
}

function QuickLinks({ assets }: { assets: number }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Shortcuts</CardTitle>
				<CardDescription>Jump to common destinations.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3">
				<LinkRow
					icon={<ImageIcon className="h-4 w-4" />}
					title="Assets"
					hint={`${assets} files`}
					href="/assets"
				/>
				<LinkRow
					icon={<Upload className="h-4 w-4" />}
					title="Upload asset"
					href="/assets/upload"
				/>
				<LinkRow
					icon={<MessageSquare className="h-4 w-4" />}
					title="Comments settings"
					href="/settings/comments"
				/>
				<LinkRow
					icon={<Settings className="h-4 w-4" />}
					title="Content settings"
					href="/settings/content"
				/>
			</CardContent>
		</Card>
	);
}

function LinkRow({
	icon,
	title,
	hint,
	href,
}: {
	icon: React.ReactNode;
	title: string;
	hint?: string;
	href: string;
}) {
	return (
		<a
			href={href}
			className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
		>
			<div className="flex items-center gap-3">
				<div className="grid h-8 w-8 place-items-center rounded-md border">
					{icon}
				</div>
				<div>
					<div className="text-sm font-medium leading-none">{title}</div>
					{hint ? (
						<div className="text-xs text-muted-foreground">{hint}</div>
					) : null}
				</div>
			</div>
		</a>
	);
}

/* demo data */
const demoDrafts: Item[] = [
	{
		id: 'd1',
		title: 'Member AMA: November',
		status: 'draft',
		date: '2h ago',
		author: 'Alex',
	},
	{
		id: 'd2',
		title: 'Behind the Scenes – Studio Move',
		status: 'draft',
		date: '5h ago',
		author: 'Chris',
	},
	{
		id: 'd3',
		title: 'Weekly Roundup #42',
		status: 'draft',
		date: '1d ago',
		author: 'Sam',
	},
];
const demoScheduled: Item[] = [
	{
		id: 's1',
		title: 'Interview: Jane Doe',
		status: 'scheduled',
		date: 'Tomorrow 10:00',
		author: 'Team',
	},
	{
		id: 's2',
		title: 'Members-only Livestream',
		status: 'scheduled',
		date: 'Fri 20:00',
		author: 'Team',
	},
];
const demoRecent: Item[] = [
	{
		id: 'r1',
		title: 'How we built our switcher stack',
		status: 'published',
		date: 'Today',
		author: 'Andrew',
	},
	{
		id: 'r2',
		title: 'Photo dump: tour highlights',
		status: 'published',
		date: 'Yesterday',
		author: 'Maddie',
	},
];

/* =========================================================
   CALENDAR
========================================================= */

function CalendarSection({
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

	const month = useMemo(() => calParseYM(ym), [ym]);
	const grid = useMemo(() => calBuildMonthGrid(month), [month]);

	const data = events ?? calDemoEvents;
	const filtered = useMemo(
		() =>
			data.filter(
				(e) => e.date.startsWith(ym) && (filter === 'all' || e.type === filter)
			),
		[data, ym, filter]
	);

	return (
		<div className="space-y-6">
			<CalendarHeader
				ym={ym}
				onPrev={() => setYm(calShiftYM(ym, -1))}
				onNext={() => setYm(calShiftYM(ym, 1))}
				onToday={() => setYm(calIsoYM(new Date()))}
			/>

			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<div>
							<CardTitle>{month.label}</CardTitle>
							<CardDescription>Announcements and publish dates</CardDescription>
						</div>
						<CalendarLegend
							filter={filter}
							setFilter={setFilter}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<CalendarMonthGrid
							grid={grid}
							events={filtered}
						/>
						<Separator />
						<CalendarAgenda events={filtered} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

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
		<div className="flex items-center justify-between">
			<div>
				<h2 className="text-xl font-semibold tracking-tight">
					Content Calendar
				</h2>
				<p className="text-sm text-muted-foreground">
					Plan announcements and publishes.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={onPrev}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<div className="w-[120px] text-center text-sm tabular-nums">{ym}</div>
				<Button
					variant="outline"
					size="icon"
					onClick={onNext}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="secondary"
					size="sm"
					onClick={onToday}
				>
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
		<div className="flex items-center gap-2">
			<Badge
				onClick={() => setFilter('all')}
				variant={filter === 'all' ? 'default' : 'outline'}
				className="cursor-pointer"
			>
				All
			</Badge>
			<Badge
				onClick={() => setFilter('publish')}
				variant={filter === 'publish' ? 'default' : 'outline'}
				className="cursor-pointer"
			>
				Publish
			</Badge>
			<Badge
				onClick={() => setFilter('announcement')}
				variant={filter === 'announcement' ? 'default' : 'outline'}
				className="cursor-pointer"
			>
				Announcement
			</Badge>
		</div>
	);
}

type CalMonthInfo = { year: number; month: number; label: string };
type CalMonthCell = { key: string; date: Date; iso: string; inMonth: boolean };

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
		<div className="space-y-2">
			<div className="grid grid-cols-7 text-xs text-muted-foreground">
				{days.map((d) => (
					<div
						key={d}
						className="px-2 py-1"
					>
						{d}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-px rounded-md border bg-border">
				{grid.flat().map((cell) => (
					<div
						key={cell.key}
						className={cn(
							'min-h-[110px] bg-background p-2',
							!cell.inMonth && 'text-muted-foreground/60'
						)}
					>
						<div className="mb-1 text-xs">
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
						<div className="space-y-1">
							{(byDay[cell.iso] ?? []).slice(0, 3).map((ev) => (
								<CalendarEventPill
									key={ev.id}
									ev={ev}
								/>
							))}
							{(byDay[cell.iso] ?? []).length > 3 && (
								<span className="block text-[10px] text-muted-foreground">
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
					<Separator />
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

function CalendarAgenda({ events }: { events: ContentEvent[] }) {
	const items = [...events].sort((a, b) => a.date.localeCompare(b.date));
	if (!items.length) return <EmptyState label="No events for this month." />;
	return (
		<div className="divide-y rounded-md border">
			{items.map((ev) => (
				<div
					key={ev.id}
					className="flex items-center gap-3 p-3 text-sm"
				>
					<div
						className={cn(
							'h-2 w-2 rounded-full',
							ev.type === 'publish' ? 'bg-emerald-500' : 'bg-sky-500'
						)}
					/>
					<div className="tabular-nums w-[94px] text-muted-foreground">
						{ev.date.slice(5)}
					</div>
					<div className="min-w-0 flex-1 truncate">{ev.title}</div>
					<Badge
						variant={ev.type === 'publish' ? 'default' : 'secondary'}
						className="capitalize"
					>
						{ev.type}
					</Badge>
				</div>
			))}
		</div>
	);
}

/* calendar utils (prefixed to avoid name collisions) */
function calIsoDate(d: Date) {
	return d.toISOString().slice(0, 10);
}
function calIsoYM(d: Date) {
	return d.toISOString().slice(0, 7);
}
function calParseYM(ym: string): CalMonthInfo {
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
function calShiftYM(ym: string, delta: number) {
	const [y, m] = ym.split('-').map(Number);
	const d = new Date(y, m - 1 + delta, 1);
	return calIsoYM(d);
}
function calIsToday(d: Date) {
	const t = new Date();
	return (
		d.getFullYear() === t.getFullYear() &&
		d.getMonth() === t.getMonth() &&
		d.getDate() === t.getDate()
	);
}
function calBuildMonthGrid(mi: CalMonthInfo): CalMonthCell[][] {
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
function calGroupEventsByDay(events: ContentEvent[]) {
	return events.reduce<Record<string, ContentEvent[]>>((acc, e) => {
		(acc[e.date] ||= []).push(e);
		return acc;
	}, {});
}

/* calendar demo data */
function calAddDaysISO(d: Date, n: number) {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return calIsoDate(x);
}
const calDemoEvents: ContentEvent[] = [
	{
		id: '1',
		title: 'Weekly Roundup #42',
		date: calIsoDate(new Date()),
		time: '10:00',
		type: 'publish',
		url: '#',
	},
	{
		id: '2',
		title: 'Show announcement: Friday Live',
		date: calAddDaysISO(new Date(), 2),
		type: 'announcement',
		url: '#',
	},
	{
		id: '3',
		title: 'Members-only AMA',
		date: calAddDaysISO(new Date(), 5),
		time: '19:00',
		type: 'publish',
	},
	{
		id: '4',
		title: 'New series teaser',
		date: calAddDaysISO(new Date(), 7),
		type: 'announcement',
	},
	{
		id: '5',
		title: 'Feature article: Studio Tour',
		date: calAddDaysISO(new Date(), 9),
		type: 'publish',
	},
];

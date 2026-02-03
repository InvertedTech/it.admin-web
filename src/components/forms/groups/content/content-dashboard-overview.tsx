'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ContentEvent, Item } from '@/lib/utils';
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
} from 'lucide-react';

import { ContentWeekView } from '@/components/content/content-week-view';
export const demoDrafts: Item[] = [
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

export const demoScheduled: Item[] = [
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

export const demoRecent: Item[] = [
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

export const weekEvents: ContentEvent[] = [
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

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
};

export const calDemoEvents: ContentEvent[] = [
	{
		id: '1',
		title: 'Weekly Roundup #42',
		date: iso(new Date()),
		time: '10:00',
		type: 'publish',
		url: '#',
	},
	{
		id: '2',
		title: 'Show announcement: Friday Live',
		date: iso(addDays(new Date(), 2)),
		type: 'announcement',
		url: '#',
	},
	{
		id: '3',
		title: 'Members-only AMA',
		date: iso(addDays(new Date(), 5)),
		time: '19:00',
		type: 'publish',
	},
	{
		id: '4',
		title: 'New series teaser',
		date: iso(addDays(new Date(), 7)),
		type: 'announcement',
	},
	{
		id: '5',
		title: 'Feature article: Studio Tour',
		date: iso(addDays(new Date(), 9)),
		type: 'publish',
	},
];

export function OverviewSection({
    stats,
    drafts,
    scheduled,
    recent,
    weekEventsData,
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
    weekEventsData?: ContentEvent[];
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
		<div className='space-y-6'>
			<OverviewHeader />

			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					title='Total'
					value={s.total}
					icon={<FileText className='h-4 w-4' />}
				/>
				<StatCard
					title='Published'
					value={s.published}
					accent='success'
				/>
				<StatCard title='Drafts' value={s.drafts} accent='warning' />
				<StatCard
					title='Scheduled'
					value={s.scheduled}
					icon={<CalendarClock className='h-4 w-4' />}
				/>
			</div>

            <ContentWeekView events={weekEventsData} />

			<div className='grid gap-6 lg:grid-cols-3'>
				<Card className='lg:col-span-2'>
					<CardHeader className='gap-2'>
						<CardTitle>Activity</CardTitle>
						<CardDescription>
							Recent drafts, scheduled posts, and updates.
						</CardDescription>
						<OverviewToolbar />
					</CardHeader>
					<CardContent>
						<Tabs defaultValue='scheduled'>
							<TabsList className='w-full justify-start overflow-x-auto'>
								<TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
								<TabsTrigger value='drafts'>Drafts</TabsTrigger>
								<TabsTrigger value='recent'>Recent</TabsTrigger>
							</TabsList>
							<TabsContent value='scheduled' className='mt-4'>
								<OverviewList
									items={scheduled ?? demoScheduled}
									empty='Nothing scheduled.'
								/>
							</TabsContent>
							<TabsContent value='drafts' className='mt-4'>
								<OverviewList
									items={drafts ?? demoDrafts}
									empty='No drafts found.'
								/>
							</TabsContent>
							<TabsContent value='recent' className='mt-4'>
								<OverviewList
									items={recent ?? demoRecent}
									empty='No recent updates.'
								/>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				<div className='space-y-6'>
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

/* internal bits */

function OverviewHeader() {
    return (
        <div className='flex items-end justify-between gap-4'>
            <div>
                <h2 className='text-xl font-semibold tracking-tight'>
                    Content Overview
                </h2>
                <p className='text-sm text-muted-foreground'>
                    Manage posts, assets, and workflow at a glance.
                </p>
            </div>
            <div className='flex gap-2'>
                <Button asChild size='sm' className='gap-2'>
                    <Link href='/content/create'>
                        <Plus className='h-4 w-4' /> Create
                    </Link>
                </Button>
                <Button asChild variant='outline' size='sm' className='gap-2'>
                    <Link href='/content/assets/upload'>
                        <Upload className='h-4 w-4' /> Upload asset
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function OverviewToolbar() {
	return (
		<div className='flex flex-wrap items-center gap-3 pt-2'>
			<div className='flex-1 min-w-[200px]'>
				<Label htmlFor='search' className='sr-only'>
					Search
				</Label>
				<Input id='search' placeholder='Search titles, tags, or IDs' />
			</div>
			<Select defaultValue='all'>
				<SelectTrigger className='w-[160px]'>
					<SelectValue placeholder='Status' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='all'>All</SelectItem>
					<SelectItem value='draft'>Draft</SelectItem>
					<SelectItem value='scheduled'>Scheduled</SelectItem>
					<SelectItem value='published'>Published</SelectItem>
				</SelectContent>
			</Select>
			<Select defaultValue='90'>
				<SelectTrigger className='w-[140px]'>
					<SelectValue placeholder='Range' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='7'>7 days</SelectItem>
					<SelectItem value='30'>30 days</SelectItem>
					<SelectItem value='90'>90 days</SelectItem>
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
			<CardHeader className='pb-2'>
				<CardDescription className='flex items-center gap-2'>
					{icon}
					{title}
				</CardDescription>
				<CardTitle className='text-3xl'>{value}</CardTitle>
			</CardHeader>
			<CardContent>
				{accent === 'success' ? (
					<Badge variant='secondary' className='rounded-full'>
						Healthy
					</Badge>
				) : accent === 'warning' ? (
					<Badge variant='outline' className='rounded-full'>
						Action needed
					</Badge>
				) : (
					<div className='h-6' />
				)}
			</CardContent>
		</Card>
	);
}

function OverviewList({ items, empty }: { items: Item[]; empty: string }) {
	if (!items?.length) return <EmptyState label={empty} />;
	return (
		<ScrollArea className='h-[360px] pr-2'>
			<ul className='divide-y divide-border'>
				{items.map((it) => (
					<li key={it.id} className='py-3 flex items-start gap-3'>
						<div className='mt-1'>
							{it.status === 'draft' ? (
								<Pencil className='h-4 w-4 text-muted-foreground' />
							) : it.status === 'scheduled' ? (
								<CalendarClock className='h-4 w-4 text-muted-foreground' />
							) : (
								<Eye className='h-4 w-4 text-muted-foreground' />
							)}
						</div>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-2'>
								<span className='truncate font-medium leading-none'>
									{it.title}
								</span>
								<Badge
									variant={badgeVariantFor(it.status)}
									className='capitalize'
								>
									{it.status}
								</Badge>
							</div>
							<p className='text-xs text-muted-foreground mt-1'>
								{it.author} • {it.date}
							</p>
						</div>
						<div className='flex gap-2'>
							<Button variant='ghost' size='icon'>
								<Pencil className='h-4 w-4' />
							</Button>
							<Button variant='ghost' size='icon'>
								<Eye className='h-4 w-4' />
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
		<div className='flex h-36 items-center justify-center rounded-md border border-dashed'>
			<p className='text-sm text-muted-foreground'>{label}</p>
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
            <CardContent className='grid gap-2'>
                <Button asChild className='justify-start gap-2'>
                    <Link href='/content/create'>
                        <Plus className='h-4 w-4' /> New post
                    </Link>
                </Button>
                <Button asChild variant='outline' className='justify-start gap-2'>
                    <Link href='/content/assets/upload'>
                        <Upload className='h-4 w-4' /> Upload asset
                    </Link>
                </Button>
                <Button asChild variant='ghost' className='justify-start gap-2'>
                    <Link href='/settings/content'>
                        <Settings className='h-4 w-4' /> Content settings
                    </Link>
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
			<CardContent className='space-y-4'>
				<div>
					<div className='mb-1 flex items-center justify-between text-sm'>
						<span>Published ratio</span>
						<span className='text-muted-foreground'>{pct}%</span>
					</div>
					<Progress value={pct} />
				</div>
				<Separator />
				<div className='flex items-center justify-between text-sm'>
					<div className='flex items-center gap-2'>
						<MessageSquare className='h-4 w-4' /> Pending comments
					</div>
					<Badge variant='secondary'>{comments}</Badge>
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
			<CardContent className='grid gap-3'>
				<LinkRow
					icon={<ImageIcon className='h-4 w-4' />}
					title='Assets'
					hint={`${assets} files`}
					href='/assets'
				/>
				<LinkRow
					icon={<Upload className='h-4 w-4' />}
					title='Upload asset'
					href='/assets/upload'
				/>
				<LinkRow
					icon={<MessageSquare className='h-4 w-4' />}
					title='Comments settings'
					href='/settings/comments'
				/>
				<LinkRow
					icon={<Settings className='h-4 w-4' />}
					title='Content settings'
					href='/settings/content'
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
			className='flex items-center justify-between rounded-md border p-3 hover:bg-accent'
		>
			<div className='flex items-center gap-3'>
				<div className='grid h-8 w-8 place-items-center rounded-md border'>
					{icon}
				</div>
				<div>
					<div className='text-sm font-medium leading-none'>
						{title}
					</div>
					{hint ? (
						<div className='text-xs text-muted-foreground'>
							{hint}
						</div>
					) : null}
				</div>
			</div>
		</a>
	);
}

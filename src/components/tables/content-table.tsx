'use client';

import * as React from 'react';
import {
	ColumnDef,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AnnounceContentForm } from '@/components/forms/announce-content-form';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ContentListRecord } from '@inverted-tech/fragments/Content';
export const ContentTypeLabels: Record<
	ContentListRecord['ContentType'],
	string
> = {
	0: 'Article',
	1: 'Video',
	2: 'Podcast',
	3: 'Livestream',
	4: 'Gallery',
};

// Accepts ISO strings or protobuf Timestamp-like values
// and returns a localized datetime string or an em dash.
type MaybeTimestamp = unknown;

function getPublishOnUTC(r: any) {
	return (
		r?.PublishOnUTC ?? r?.PublishOnUtc ?? r?.publishOnUtc ?? r?.publishOnUTC
	);
}

function toJsDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return undefined;

	// If already a Date
	if (value instanceof Date) return value;

	// If a string, try parse as ISO
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}

	// If it looks like a protobuf Timestamp with toDate()
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

	// If it looks like { seconds, nanos } (common TS Timestamp shape)
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

export function fmtDate(input?: MaybeTimestamp) {
	const d = input ? toJsDate(input) : undefined;
	if (!d) return '—';
	return d.toLocaleString();
}

export function levelLabel(level: number) {
	if (level <= 0) return 'Free';
	if (level === 1) return 'Subscriber';
	if (level === 2) return 'Paid';
	return `Level ${level}`;
}

const columns: ColumnDef<ContentListRecord>[] = [
	// Title
	{
		accessorKey: 'Title',
		header: ({ column }) => (
			<Button
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Title <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => {
			const r = row.original;
			const title = r.Title;
			return (
				<div className='flex items-center gap-2'>
					<a
						href={`/content/${r.ContentID}`}
						className='underline underline-offset-2'
					>
						{title}
					</a>
					<a
						href={`/content/${r.ContentID}/edit`}
						className='text-muted-foreground hover:text-foreground text-xs underline underline-offset-2'
					>
						Edit
					</a>
				</div>
			);
		},
	},

	// Author
	{
		accessorKey: 'Author',
		header: ({ column }) => (
			<Button
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Author <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
	},

	// Type
	{
		accessorKey: 'ContentType',
		header: 'Type',
		cell: ({ row }) => {
			const t = row.original.ContentType;
			return <Badge variant='secondary'>{ContentTypeLabels[t]}</Badge>;
		},
	},

	// Subscription
	{
		accessorKey: 'SubscriptionLevel',
		header: 'Access',
		cell: ({ row }) => (
			<Badge>{levelLabel(row.original.SubscriptionLevel)}</Badge>
		),
	},

	// Dates
	{
		accessorKey: 'CreatedOnUTC',
		header: ({ column }) => (
			<Button
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Created <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span className='whitespace-nowrap'>
				{fmtDate(row.original.CreatedOnUTC)}
			</span>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'PublishOnUTC',
		header: 'Publish',
		cell: ({ row }) => (
			<span className='whitespace-nowrap'>
				{fmtDate(getPublishOnUTC(row.original))}
			</span>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'AnnounceOnUTC',
		header: 'Announce',
		cell: ({ row }) => (
			<span className='whitespace-nowrap'>
				{fmtDate((row.original as any)?.AnnounceOnUTC)}
			</span>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'PinnedOnUTC',
		header: 'Pinned',
		cell: ({ row }) => (
			<span className='whitespace-nowrap'>
				{fmtDate(row.original.PinnedOnUTC)}
			</span>
		),
		enableHiding: true,
	},


	// Actions
	{
		id: 'actions',
		cell: ({ row }) => {
			const r = row.original;
			const router = useRouter();
			const [announceOpen, setAnnounceOpen] = React.useState(false);

			async function doPublish() {
				try {
					const res = await fetch(
						`/api/admin/content/${r.ContentID}/publish`,
						{
							method: 'POST',
						},
					);
					if (!res.ok) throw new Error('Request failed');
					toast.success('Publish requested');
					router.refresh();
				} catch {
					toast.error('Failed to publish');
				}
			}

			async function doUnpublish() {
				try {
					const res = await fetch(
						`/api/admin/content/${r.ContentID}/unpublish`,
						{ method: 'POST' },
					);
					if (!res.ok) throw new Error('Request failed');
					toast.success('Unpublish requested');
					router.refresh();
				} catch {
					toast.error('Failed to unpublish');
				}
			}

			async function doDelete() {
				try {
					if (!window.confirm('Delete this content?')) return;
					const res = await fetch(
						`/api/admin/content/${r.ContentID}/delete`,
						{
							method: 'POST',
						},
					);
					if (!res.ok) throw new Error('Request failed');
					toast.success('Delete requested');
					router.refresh();
				} catch {
					toast.error('Failed to delete');
				}
			}

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='h-8 w-8 p-0'>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-40'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() =>
								navigator.clipboard.writeText(r.ContentID)
							}
						>
							Copy ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<a href={`/content/${r.ContentID}`}>View</a>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<a href={`/content/${r.ContentID}/edit`}>Edit</a>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{Boolean((r as any)?.AnnounceOnUTC) ? (
							<DropdownMenuItem
								onClick={async () => {
									try {
										const res = await fetch(
											`/api/admin/content/${r.ContentID}/unannounce`,
											{ method: 'POST' },
										);
										if (!res.ok)
											throw new Error('Request failed');
										toast.success('Unannounce requested');
										router.refresh();
									} catch {
										toast.error('Failed to unannounce');
									}
								}}
							>
								Unannounce
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => setAnnounceOpen(true)}
							>
								Announce…
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						{getPublishOnUTC(r) ? (
							<DropdownMenuItem onClick={doUnpublish}>
								Unpublish
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={doPublish}>
								Publish
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className='text-destructive'
							onClick={doDelete}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
					<Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
						<DialogContent
							className='sm:max-w-xl max-h-[80vh] overflow-y-auto'
							aria-describedby='announce-desc'
						>
							<DialogTitle>Announce Content</DialogTitle>
							<p
								id='announce-desc'
								className='text-muted-foreground text-sm'
							>
								Choose a date and time to announce this content.
							</p>
							<AnnounceContentForm contentId={r.ContentID} />
						</DialogContent>
					</Dialog>
				</DropdownMenu>
			);
		},
	},
];

export function ContentTable({
	data,
	pageSize = 25,
}: {
	data: ContentListRecord[];
	pageSize?: number;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		getRowId: (row) => row.ContentID,
		state: { sorting, columnVisibility },
		initialState: { pagination: { pageSize } },
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	React.useEffect(() => {
		if (pageSize && table.getState().pagination.pageSize !== pageSize) {
			table.setPageSize(pageSize);
		}
	}, [pageSize, table]);

	return (
		<div>
			{/* Column toggle (matches members table) */}
			<div className='flex justify-end gap-2 py-2'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline'>Columns</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{table
							.getAllColumns()
							.filter((c) => c.getCanHide())
							.map((c) => (
								<DropdownMenuCheckboxItem
									key={c.id}
									checked={c.getIsVisible()}
									onCheckedChange={(v) =>
										c.toggleVisibility(!!v)
									}
									className='capitalize'
								>
									{c.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table */}
			<div className='overflow-hidden rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Footer */}
			<div className='mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
				<div className='text-muted-foreground text-sm'>
					{table.getRowModel().rows.length} shown.
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}


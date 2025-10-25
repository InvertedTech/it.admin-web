'use client';

import * as React from 'react';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import {
	ContentListRecord,
	ContentType,
	GetAllContentAdminResponse,
} from '@inverted-tech/fragments/Content';
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
	// Selection
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(v) => row.toggleSelected(!!v)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 32,
	},

	// Title
	{
		accessorKey: 'Title',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Title <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const title = row.original.Title;
			const url = row.original.URL;
			return url ? (
				<a
					href={url}
					className="underline underline-offset-2"
					target="_blank"
					rel="noreferrer"
				>
					{title}
				</a>
			) : (
				<span className="font-medium">{title}</span>
			);
		},
	},

	// Author
	{
		accessorKey: 'Author',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Author <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},

	// Type
	{
		accessorKey: 'ContentType',
		header: 'Type',
		cell: ({ row }) => {
			const t = row.original.ContentType;
			return <Badge variant="secondary">{ContentTypeLabels[t]}</Badge>;
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
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Created <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{fmtDate(row.original.CreatedOnUTC)}
			</span>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'PublishOnUTC',
		header: 'Publish',
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{fmtDate(row.original.PublishOnUTC)}
			</span>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'PinnedOnUTC',
		header: 'Pinned',
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{fmtDate(row.original.PinnedOnUTC)}
			</span>
		),
		enableHiding: true,
	},

	// Flags
	{
		id: 'flags',
		header: 'Flags',
		cell: ({ row }) => {
			const r = row.original;
			const flags = [
				r.IsLiveStream ? 'Livestream' : null,
				r.IsLive ? 'Live' : null,
				r.FeaturedImageAssetID ? 'Featured' : null,
				r.PinnedOnUTC ? 'Pinned' : null,
			].filter(Boolean) as string[];

			return flags.length ? (
				<div className="flex flex-wrap gap-1">
					{flags.map((f) => (
						<Badge
							key={f}
							variant="outline"
							className="px-1.5"
						>
							{f}
						</Badge>
					))}
				</div>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},

	// Relations (counts)
	{
		id: 'relations',
		header: 'Relations',
		cell: ({ row }) => {
			const cats = row.original.CategoryIds?.length || 0;
			const chans = row.original.ChannelIds?.length || 0;
			return (
				<div className="text-sm text-muted-foreground">
					{cats} cat · {chans} ch
				</div>
			);
		},
		enableHiding: true,
	},

	// Actions
	{
		id: 'actions',
		cell: ({ row }) => {
			const r = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-8 w-8 p-0"
						>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-40"
					>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(r.ContentID)}
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
						<DropdownMenuItem
							className="text-destructive"
							asChild
						>
							<a href={`/content/${r.ContentID}/delete`}>Delete</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function ContentTable({ data }: { data: ContentListRecord[] }) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	const table = useReactTable({
		data,
		columns,
		getRowId: (row) => row.ContentID,
		state: { sorting, columnFilters, columnVisibility, rowSelection },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div>
			{/* Filters + column toggle */}
			<div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
				<Input
					placeholder="Filter by title…"
					className="max-w-xs"
					value={(table.getColumn('Title')?.getFilterValue() as string) ?? ''}
					onChange={(e) =>
						table.getColumn('Title')?.setFilterValue(e.target.value)
					}
				/>
				<Input
					placeholder="Filter by author…"
					className="max-w-xs sm:ml-2"
					value={(table.getColumn('Author')?.getFilterValue() as string) ?? ''}
					onChange={(e) =>
						table.getColumn('Author')?.setFilterValue(e.target.value)
					}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="ml-auto"
						>
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((c) => c.getCanHide())
							.map((c) => (
								<DropdownMenuCheckboxItem
									key={c.id}
									checked={c.getIsVisible()}
									onCheckedChange={(v) => c.toggleVisibility(!!v)}
									className="capitalize"
								>
									{c.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Footer */}
			<div className="mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
				<div className="text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{' '}
					{table.getFilteredRowModel().rows.length} selected.
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
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

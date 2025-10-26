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
import { Badge } from '@/components/ui/badge';
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
import type {
	SearchUsersAdminResponse,
	UserSearchRecord,
} from '@inverted-tech/fragments/Authentication';

const g = (obj: any, paths: string[], fb?: any) => {
	for (const p of paths) {
		const v = p.split('.').reduce<any>((o, k) => (o ? o[k] : undefined), obj);
		if (v !== undefined && v !== null) return v;
	}
	return fb;
};

// dates
type MaybeTimestamp = unknown;
const toJsDate = (v: MaybeTimestamp) => {
	if (!v) return;
	if (v instanceof Date) return v;
	if (typeof v === 'string') {
		const d = new Date(v);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	if (typeof v === 'object' && v && 'seconds' in (v as any)) {
		const s = Number((v as any).seconds ?? 0);
		const n = Number((v as any).nanos ?? 0);
		const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
};
const fmtDate = (v?: MaybeTimestamp) => {
	const d = v ? toJsDate(v) : undefined;
	return d ? d.toLocaleString() : '—';
};

export const userColumns: ColumnDef<any>[] = [
	{
		/* select col unchanged */ id: 'select',
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

	{
		id: 'DisplayName',
		accessorFn: (r) => g(r, ['DisplayName', 'Public.Data.DisplayName'], ''),
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Name <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const id = g(row.original, ['UserID', 'Public.UserID'], '');
			const display = row.getValue<string>('DisplayName') || '—';
			const userName = g(
				row.original,
				['UserName', 'Public.Data.UserName'],
				''
			);
			return (
				<div className="flex min-w-0 flex-col">
					<a
						href={`/users/${id}`}
						className="truncate underline underline-offset-2"
					>
						{display}
					</a>
					<span className="text-muted-foreground truncate text-xs">
						@{userName || '—'}
					</span>
				</div>
			);
		},
	},

	{
		id: 'Email',
		accessorFn: (r) =>
			g(r, ['Email', 'Private.Data.Email', 'Public.Data.Email'], ''),
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Email <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="truncate">
				{(row.getValue('Email') as string) || '—'}
			</span>
		),
	},

	{
		id: 'roles',
		accessorFn: (r) => g(r, ['Roles', 'Private.Roles'], []) as string[],
		header: 'Roles',
		cell: ({ row }) => {
			const roles = (row.getValue('roles') as string[]) ?? [];
			return roles.length ? (
				<div className="flex flex-wrap gap-1">
					{roles.map((r) => (
						<Badge
							key={r}
							variant="outline"
							className="px-1.5"
						>
							{r}
						</Badge>
					))}
				</div>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},

	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const disabledOn = g(row.original, [
				'DisabledOnUTC',
				'Private.DisabledOnUTC',
			]);
			const disabled = Boolean(toJsDate(disabledOn));
			return (
				<Badge variant={disabled ? 'secondary' : 'default'}>
					{disabled ? 'Disabled' : 'Active'}
				</Badge>
			);
		},
	},

	{
		id: 'CreatedOnUTC',
		accessorFn: (r) => g(r, ['CreatedOnUTC', 'Public.CreatedOnUTC']),
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
				{fmtDate(row.getValue('CreatedOnUTC'))}
			</span>
		),
		enableHiding: true,
	},
	{
		id: 'ModifiedOnUTC',
		accessorFn: (r) => g(r, ['ModifiedOnUTC', 'Public.ModifiedOnUTC']),
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Modified <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{fmtDate(row.getValue('ModifiedOnUTC'))}
			</span>
		),
		enableHiding: true,
	},
	{
		id: 'DisabledOnUTC',
		accessorFn: (r) => g(r, ['DisabledOnUTC', 'Private.DisabledOnUTC']),
		header: 'Disabled',
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{fmtDate(row.getValue('DisabledOnUTC'))}
			</span>
		),
		enableHiding: true,
	},

	{
		id: 'actions',
		cell: ({ row }) => {
			const id = g(row.original, ['UserID', 'Public.UserID'], '');
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
							onClick={() => navigator.clipboard.writeText(String(id))}
						>
							Copy ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<a href={`/users/${id}`}>View</a>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<a href={`/users/${id}/edit`}>Edit</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

// --- table ---
export function UsersTable({ data }: { data: UserSearchRecord[] }) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	const table = useReactTable({
		data,
		columns: userColumns,
		getRowId: (row) => g(row, ['UserID', 'Public.UserID'], crypto.randomUUID()),
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
			{/* filters */}
			<div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
				<Input
					placeholder="Filter by name…"
					className="max-w-xs"
					value={
						(table.getColumn('DisplayName')?.getFilterValue() as string) ?? ''
					}
					onChange={(e) =>
						table.getColumn('DisplayName')?.setFilterValue(e.target.value)
					}
				/>
				<Input
					placeholder="Filter by email…"
					className="max-w-xs sm:ml-2"
					value={(table.getColumn('Email')?.getFilterValue() as string) ?? ''}
					onChange={(e) =>
						table.getColumn('Email')?.setFilterValue(e.target.value)
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

			{/* table */}
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
									colSpan={userColumns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* footer */}
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

// helper to consume the API response directly
export function UsersTableFromResponse({
	resp,
}: {
	resp: SearchUsersAdminResponse;
}) {
	return <UsersTable data={resp?.Records ?? []} />;
}

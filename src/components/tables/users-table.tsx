'use client';

import * as React from 'react';
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Roles as AllRoles, RoleCategories, RoleMeta } from '@/lib/roles';
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
import { Skeleton } from '@/components/ui/skeleton';
import type {
	SearchUsersAdminResponse,
	UserSearchRecord,
} from '@inverted-tech/fragments/Authentication';

// ---------- helpers ----------
const g = (obj: any, paths: string[], fb?: any) => {
	for (const p of paths) {
		const v = p
			.split('.')
			.reduce<any>((o, k) => (o ? o[k] : undefined), obj);
		if (v !== undefined && v !== null) return v;
	}
	return fb;
};

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

// ---------- columns ----------
export const userColumns: ColumnDef<any>[] = [
	// {
	// 	id: 'select',
	// 	header: ({ table }) => (
	// 		<Checkbox
	// 			checked={
	// 				table.getIsAllPageRowsSelected() ||
	// 				(table.getIsSomePageRowsSelected() && 'indeterminate')
	// 			}
	// 			onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
	// 			aria-label="Select all"
	// 		/>
	// 	),
	// 	cell: ({ row }) => (
	// 		<Checkbox
	// 			checked={row.getIsSelected()}
	// 			onCheckedChange={(v) => row.toggleSelected(!!v)}
	// 			aria-label="Select row"
	// 		/>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false,
	// 	size: 32,
	// },

	{
		id: 'DisplayName',
		accessorFn: (r) => g(r, ['DisplayName', 'Public.Data.DisplayName'], ''),
		header: ({ column }) => (
			<Button
				type='button'
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Name <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => {
			const id = g(row.original, ['UserID', 'Public.UserID'], '');
			const display = row.getValue<string>('DisplayName') || '—';
			const userName = g(
				row.original,
				['UserName', 'Public.Data.UserName'],
				'',
			);
			return (
				<div className='flex min-w-0 flex-col'>
					<span className='truncate'>{display}</span>
					<span className='text-muted-foreground truncate text-xs'>
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
				type='button'
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Email <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span className='truncate'>
				{(row.getValue('Email') as string) || '—'}
			</span>
		),
	},

	{
		id: 'roles',
		accessorKey: 'Roles',
		header: 'Roles',
		cell: ({ row }) => {
			const roles: string[] = (row.getValue('roles') as string[]) ?? [];
			return roles && roles.length ? (
				<div className='flex flex-wrap gap-1'>
					{roles.map((r) => (
						<Badge key={r} variant='outline' className='px-1.5'>
							{RoleMeta[r as keyof typeof RoleMeta]?.label ?? r}
						</Badge>
					))}
				</div>
			) : (
				<span className='text-muted-foreground'>—</span>
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
				type='button'
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
				type='button'
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Modified <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span className='whitespace-nowrap'>
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
			<span className='whitespace-nowrap'>
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
							type='button'
							variant='ghost'
							className='h-8 w-8 p-0'
						>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-40'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() =>
								navigator.clipboard.writeText(String(id))
							}
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

// ---------- table ----------
export function UsersTable({
	data,
	onPrevPage,
	onNextPage,
	hasPrev,
	hasNext,
	clientSort = true, // set false if server-sorting
	showColumnPicker = true,
	loading = false,
	skeletonRows = 8,
	filterButton,
}: {
	data: UserSearchRecord[];
	onPrevPage?: () => void;
	onNextPage?: () => void;
	hasPrev?: boolean;
	hasNext?: boolean;
	clientSort?: boolean;
	showColumnPicker?: boolean;
	loading?: boolean;
	skeletonRows?: number;
	filterButton?: React.ReactNode;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<
		Record<string, boolean>
	>({
		CreatedOnUTC: false,
		ModifiedOnUTC: false,
		DisabledOnUTC: false,
	});
	const [rowSelection, setRowSelection] = React.useState({});
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const includeDeletedParam =
		searchParams?.get('IncludeDeleted') ??
		searchParams?.get('includeDeleted');
	const includeDeleted =
		includeDeletedParam === '1' || includeDeletedParam === 'true';
	const [optionsOpen, setOptionsOpen] = React.useState(false);
	const [includeDeletedChecked, setIncludeDeletedChecked] =
		React.useState<boolean>(includeDeleted);
	const currentRoles = (searchParams?.getAll('Roles') ?? []) as string[];
	const currentUserIDs = (searchParams?.getAll('UserIDs') ?? []) as string[];
	const currentQuery = searchParams?.get('SearchString') ?? '';
	const [rolesSelected, setRolesSelected] =
		React.useState<string[]>(currentRoles);
	const [query, setQuery] = React.useState<string>(currentQuery);
	const [userIds, setUserIds] = React.useState<string[]>(currentUserIDs);
	const [userIdInput, setUserIdInput] = React.useState<string>('');

	React.useEffect(() => {
		setIncludeDeletedChecked(includeDeleted);
		setRolesSelected((searchParams?.getAll('Roles') ?? []) as string[]);
		setUserIds((searchParams?.getAll('UserIDs') ?? []) as string[]);
		setQuery(searchParams?.get('SearchString') ?? '');
	}, [includeDeleted, searchParams]);

	function applyOptions() {
		const params = new URLSearchParams(searchParams?.toString());
		if (includeDeletedChecked) {
			params.set('IncludeDeleted', '1');
			params.set('includeDeleted', '1');
		} else {
			params.delete('IncludeDeleted');
			params.delete('includeDeleted');
		}
		// Roles
		params.delete('Roles');
		for (const r of rolesSelected) params.append('Roles', r);
		// User IDs
		params.delete('UserIDs');
		for (const id of userIds) params.append('UserIDs', id);
		// SearchString
		if (query && query.trim()) params.set('SearchString', query.trim());
		else params.delete('SearchString');
		router.push(`${pathname}?${params.toString()}`);
		setOptionsOpen(false);
		toast.success('Updated list options');
	}

	function toggleRole(role: string, next: boolean) {
		setRolesSelected((prev) => {
			if (next) return prev.includes(role) ? prev : [...prev, role];
			return prev.filter((r) => r !== role);
		});
	}

	const allRolesSelected = rolesSelected.length === AllRoles.length;

	function addUserId(raw?: string) {
		const val = (raw ?? userIdInput).trim();
		if (!val) return;
		setUserIds((prev) => (prev.includes(val) ? prev : [...prev, val]));
		setUserIdInput('');
	}

	function removeUserId(id: string) {
		setUserIds((prev) => prev.filter((v) => v !== id));
	}

	const table = useReactTable({
		data,
		columns: userColumns,
		getRowId: (row) =>
			g(row, ['UserID', 'Public.UserID'], crypto.randomUUID()),
		state: {
			...(clientSort ? { sorting } : {}),
			columnVisibility,
			rowSelection,
		},
		onSortingChange: clientSort ? setSorting : undefined,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		...(clientSort ? { getSortedRowModel: getSortedRowModel() } : {}),
	});

	return (
		<div>
			{/* optional column picker, no filters or local pagination */}
			{showColumnPicker ? (
				<div className='flex justify-end gap-2 py-2'>
					{filterButton}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type='button' variant='outline'>
								Columns
							</Button>
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
			) : null}

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
						{loading ? (
							Array.from({ length: skeletonRows }).map(
								(_, rowIdx) => (
									<TableRow key={`skeleton-${rowIdx}`}>
										{table
											.getVisibleLeafColumns()
											.map((col, colIdx) => (
												<TableCell
													key={`${col.id}-${colIdx}`}
												>
													{colIdx === 0 ? (
														<div className='flex min-w-0 flex-col gap-1'>
															<Skeleton className='h-4 w-32' />
															<Skeleton className='h-3 w-24' />
														</div>
													) : colIdx === 1 ? (
														<Skeleton className='h-4 w-44' />
													) : colIdx === 2 ? (
														<div className='flex flex-wrap gap-1'>
															<Skeleton className='h-4 w-14 rounded-full' />
															<Skeleton className='h-4 w-12 rounded-full' />
														</div>
													) : colIdx === 3 ? (
														<Skeleton className='h-5 w-14 rounded-full' />
													) : (
														<Skeleton className='h-4 w-6' />
													)}
												</TableCell>
											))}
									</TableRow>
								),
							)
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => {
								const userId = g(
									row.original,
									['UserID', 'Public.UserID'],
									'',
								);
								return (
									<TableRow
										key={row.id}
										data-state={
											row.getIsSelected() && 'selected'
										}
										onClick={() =>
											router.push(`/users/${userId}`)
										}
										className='cursor-pointer hover:bg-muted/50'
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={userColumns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className='mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
				<div className='text-muted-foreground text-sm'>
					{loading ? 'Loading…' : `${data.length} shown.`}
				</div>
				<div className='flex gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onPrevPage}
						disabled={!hasPrev || loading}
					>
						Previous
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onNextPage}
						disabled={!hasNext || loading}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

// convenience if you already have API response
export function UsersTableFromResponse({
	resp,
	...p
}: { resp: SearchUsersAdminResponse } & Omit<
	React.ComponentProps<typeof UsersTable>,
	'data'
>) {
	return <UsersTable data={resp?.Records ?? []} {...p} />;
}

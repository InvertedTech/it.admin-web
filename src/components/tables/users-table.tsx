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
import { Roles as AllRoles, RoleCategories, RoleMeta } from '@/lib/types';
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

// ---------- helpers ----------
const g = (obj: any, paths: string[], fb?: any) => {
	for (const p of paths) {
		const v = p.split('.').reduce<any>((o, k) => (o ? o[k] : undefined), obj);
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
		accessorKey: 'Roles',
		header: 'Roles',
		cell: ({ row }) => {
			const roles: string[] = (row.getValue('roles') as string[]) ?? [];
			return roles && roles.length ? (
				<div className="flex flex-wrap gap-1">
					{roles.map((r) => (
						<Badge key={r} variant="outline" className="px-1.5">
							{RoleMeta[r as keyof typeof RoleMeta]?.label ?? r}
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

// ---------- table ----------
export function UsersTable({
	data,
	onPrevPage,
	onNextPage,
	hasPrev,
	hasNext,
	clientSort = true, // set false if server-sorting
	showColumnPicker = true,
}: {
	data: UserSearchRecord[];
	onPrevPage?: () => void;
	onNextPage?: () => void;
	hasPrev?: boolean;
	hasNext?: boolean;
	clientSort?: boolean;
	showColumnPicker?: boolean;
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
    const includeDeletedParam = searchParams?.get('includeDeleted');
    const includeDeleted = includeDeletedParam === '1' || includeDeletedParam === 'true';
    const [optionsOpen, setOptionsOpen] = React.useState(false);
    const [includeDeletedChecked, setIncludeDeletedChecked] = React.useState<boolean>(includeDeleted);
    const currentRoles = (searchParams?.getAll('Roles') ?? []) as string[];
    const currentUserIDs = (searchParams?.getAll('UserIDs') ?? []) as string[];
    const currentQuery = searchParams?.get('SearchString') ?? '';
    const [rolesSelected, setRolesSelected] = React.useState<string[]>(currentRoles);
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
        if (includeDeletedChecked) params.set('includeDeleted', '1');
        else params.delete('includeDeleted');
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
		getRowId: (row) => g(row, ['UserID', 'Public.UserID'], crypto.randomUUID()),
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
                <div className="flex justify-end gap-2 py-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Columns</Button>
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
                    <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Filters</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Users List Options</DialogTitle>
                                <DialogDescription>Adjust filters for the users list.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="include-deleted"
                                        checked={includeDeletedChecked}
                                        onCheckedChange={setIncludeDeletedChecked}
                                    />
                                    <Label htmlFor="include-deleted">Include deleted</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="search-string">Search</Label>
                                    <Input
                                        id="search-string"
                                        placeholder="Name, username, email…"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Roles</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="roles-all"
                                                checked={allRolesSelected}
                                                onCheckedChange={(v) => setRolesSelected(Boolean(v) ? [...AllRoles] : [])}
                                            />
                                            <Label htmlFor="roles-all">All roles</Label>
                                        </div>
                                        {RoleCategories.map((cat) => (
                                            <div key={cat} className="space-y-1">
                                                <div className="text-xs text-muted-foreground">{cat}</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {AllRoles.filter((r) => RoleMeta[r].category === cat).map((r) => (
                                                        <label key={r} className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={rolesSelected.includes(r)}
                                                                onCheckedChange={(v) => toggleRole(r, Boolean(v))}
                                                            />
                                                            <span className="text-sm">{RoleMeta[r].label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">User IDs</div>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        {userIds.length === 0 && (
                                            <div className='text-muted-foreground text-sm'>No IDs added</div>
                                        )}
                                        {userIds.map((id) => (
                                            <button
                                                key={id}
                                                type='button'
                                                className='border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs'
                                                onClick={() => removeUserId(id)}
                                            >
                                                <span>{id}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3 opacity-60"><path fillRule="evenodd" d="M6.72 6.72a.75.75 0 011.06 0L12 10.94l4.22-4.22a.75.75 0 111.06 1.06L13.06 12l4.22 4.22a.75.75 0 11-1.06 1.06L12 13.06l-4.22 4.22a.75.75 0 11-1.06-1.06L10.94 12 6.72 7.78a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                                            </button>
                                        ))}
                                    </div>
                                    <div className='mt-2 flex items-center gap-2'>
                                        <Input
                                            placeholder='Add user ID and press Enter'
                                            value={userIdInput}
                                            onChange={(e) => setUserIdInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addUserId();
                                                }
                                            }}
                                        />
                                        <Button type='button' variant='outline' onClick={() => addUserId()}>Add</Button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOptionsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={applyOptions}>Apply</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : null}

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

			<div className="mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
				<div className="text-muted-foreground text-sm">
					{data.length} shown.
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onPrevPage}
						disabled={!hasPrev}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onNextPage}
						disabled={!hasNext}
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
	return (
		<UsersTable
			data={resp?.Records ?? []}
			{...p}
		/>
	);
}

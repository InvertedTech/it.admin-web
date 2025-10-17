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
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { NewChannelForm } from '../forms/new-channel-form';

export type ChannelRecord = {
	ChannelId: string;
	ParentChannelId: string;
	DisplayName: string;
	UrlStub: string;
	ImageAssetId: string;
	YoutubeUrl: string;
	RumbleUrl: string;
	OldChannelId: string;
};

const channelColumns: ColumnDef<ChannelRecord>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(v) => row.toggleSelected(!!v)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 32,
	},
	{
		accessorKey: 'DisplayName',
		header: ({ column }) => (
			<Button
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Display Name <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span className='font-medium'>{row.original.DisplayName}</span>
		),
	},
	{ accessorKey: 'UrlStub', header: 'Slug' },
	{ accessorKey: 'ParentChannelId', header: 'Parent', enableHiding: true },
	{
		accessorKey: 'ImageAssetId',
		header: 'Image',
		cell: ({ row }) =>
			row.original.ImageAssetId ? (
				<code className='text-xs'>{row.original.ImageAssetId}</code>
			) : (
				<span className='text-muted-foreground'>—</span>
			),
	},
	{
		accessorKey: 'YoutubeUrl',
		header: 'YouTube',
		cell: ({ row }) =>
			row.original.YoutubeUrl ? (
				<a
					className='underline'
					href={row.original.YoutubeUrl}
					target='_blank'
					rel='noreferrer'
				>
					Link
				</a>
			) : (
				<span className='text-muted-foreground'>—</span>
			),
	},
	{
		accessorKey: 'RumbleUrl',
		header: 'Rumble',
		cell: ({ row }) =>
			row.original.RumbleUrl ? (
				<a
					className='underline'
					href={row.original.RumbleUrl}
					target='_blank'
					rel='noreferrer'
				>
					Link
				</a>
			) : (
				<span className='text-muted-foreground'>—</span>
			),
	},
	{ accessorKey: 'OldChannelId', header: 'Old ID', enableHiding: true },
	{
		id: 'actions',
		cell: ({ row }) => {
			const ch = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='h-8 w-8 p-0'>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() =>
								navigator.clipboard.writeText(ch.ChannelId)
							}
						>
							Copy channel ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<a
								href={`/content/settings/channels/${ch.ChannelId}`}
							>
								View
							</a>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<a
								href={`/content/settings/channels/${ch.ChannelId}/edit`}
							>
								Edit
							</a>
						</DropdownMenuItem>
						<DropdownMenuItem className='text-destructive' asChild>
							<a
								href={`/content/settings/channels/${ch.ChannelId}/delete`}
							>
								Delete
							</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function ChannelsTable({ data }: { data: ChannelRecord[] }) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const table = useReactTable({
		data,
		columns: channelColumns,
		getRowId: (row) => row.ChannelId,
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
			<div className='flex items-center gap-2 py-4'>
				<Input
					placeholder='Filter by name…'
					value={
						(table
							.getColumn('DisplayName')
							?.getFilterValue() as string) ?? ''
					}
					onChange={(e) =>
						table
							.getColumn('DisplayName')
							?.setFilterValue(e.target.value)
					}
					className='max-w-sm'
				/>
				{/* <DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' className='ml-auto'>
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{table
							.getAllColumns()
							.filter((col) => col.getCanHide())
							.map((col) => (
								<DropdownMenuCheckboxItem
									key={col.id}
									checked={col.getIsVisible()}
									onCheckedChange={(v) =>
										col.toggleVisibility(!!v)
									}
									className='capitalize'
								>
									{col.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu> */}
				<Dialog>
					<DialogTrigger>
						<Button variant={'outline'}>Create</Button>
					</DialogTrigger>
					<DialogContent>
						<NewChannelForm />
					</DialogContent>
				</Dialog>
			</div>

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
									data-state={
										row.getIsSelected() && 'selected'
									}
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
									colSpan={channelColumns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className='text-muted-foreground mt-2 text-sm'>
				{table.getFilteredSelectedRowModel().rows.length} of{' '}
				{table.getFilteredRowModel().rows.length} selected.
			</div>

			<div className='flex items-center justify-end gap-2 py-4'>
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
	);
}

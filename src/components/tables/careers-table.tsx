'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { CareerListRecord } from '@inverted-tech/fragments/Careers';
import { JobType } from '@inverted-tech/fragments/Careers';

// ---------- helpers ----------
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

const JOB_TYPE_LABELS: Record<number, string> = {
	[JobType.FULL_TIME]: 'Full Time',
	[JobType.PART_TIME]: 'Part Time',
	[JobType.HYBRID]: 'Hybrid',
	[JobType.REMOTE]: 'Remote',
	[JobType.CONTRACT]: 'Contract',
};

// ---------- columns ----------
const careerColumns: ColumnDef<CareerListRecord>[] = [
	{
		id: 'Title',
		accessorKey: 'Title',
		header: ({ column }) => (
			<Button
				type='button'
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Title <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span className='font-medium'>{row.original.Title || '—'}</span>
		),
	},
	{
		id: 'Company',
		accessorKey: 'Company',
		header: ({ column }) => (
			<Button
				type='button'
				variant='ghost'
				onClick={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			>
				Company <ArrowUpDown className='ml-2 h-4 w-4' />
			</Button>
		),
		cell: ({ row }) => (
			<span>{row.original.Company || '—'}</span>
		),
	},
	{
		id: 'Location',
		header: 'Location',
		cell: ({ row }) => {
			const area = row.original.Location?.Area;
			return <span>{area || '—'}</span>;
		},
	},
	{
		id: 'EmploymentType',
		header: 'Type',
		cell: ({ row }) => {
			const type = row.original.Location?.EmploymentType;
			const label = type !== undefined ? JOB_TYPE_LABELS[type] : undefined;
			return label ? (
				<Badge variant='outline'>{label}</Badge>
			) : (
				<span className='text-muted-foreground'>—</span>
			);
		},
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const deleted = Boolean(toJsDate(row.original.DeletedOnUTC));
			return (
				<Badge variant={deleted ? 'secondary' : 'default'}>
					{deleted ? 'Deleted' : 'Active'}
				</Badge>
			);
		},
	},
	{
		id: 'CreatedOnUTC',
		accessorKey: 'CreatedOnUTC',
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
				{fmtDate(row.original.CreatedOnUTC)}
			</span>
		),
		enableHiding: true,
	},
];

// ---------- table ----------
export function CareersTable({
	data,
	onPrevPage,
	onNextPage,
	hasPrev,
	hasNext,
	loading = false,
	skeletonRows = 8,
	filterButton,
}: {
	data: CareerListRecord[];
	onPrevPage?: () => void;
	onNextPage?: () => void;
	hasPrev?: boolean;
	hasNext?: boolean;
	loading?: boolean;
	skeletonRows?: number;
	filterButton?: React.ReactNode;
}) {
	const router = useRouter();
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns: careerColumns,
		getRowId: (row) => row.CareerId || crypto.randomUUID(),
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div>
			<div className='flex justify-end gap-2 py-2'>{filterButton}</div>

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
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading ? (
							Array.from({ length: skeletonRows }).map((_, rowIdx) => (
								<TableRow key={`skeleton-${rowIdx}`}>
									{table.getVisibleLeafColumns().map((col, colIdx) => (
										<TableCell key={`${col.id}-${colIdx}`}>
											{colIdx === 0 ? (
												<Skeleton className='h-4 w-40' />
											) : colIdx === 1 ? (
												<Skeleton className='h-4 w-28' />
											) : colIdx === 2 ? (
												<Skeleton className='h-4 w-24' />
											) : colIdx === 3 ? (
												<Skeleton className='h-5 w-16 rounded-full' />
											) : (
												<Skeleton className='h-4 w-12' />
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
								key={row.id}
								className="cursor-pointer"
								onClick={() => router.push(`/careers/${row.original.CareerId}`)}
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
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={careerColumns.length}
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

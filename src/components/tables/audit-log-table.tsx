'use client';

import { Fragment, useState } from 'react';
import { AuditLogEntry, ActionType } from '@inverted-tech/fragments/AuditLog';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { tsToDate } from '@/lib/utils';
import { Button } from '../ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';

type Props = {
	data: AuditLogEntry[];
	loading?: boolean;
};

type AuditFieldChangeLike = {
	FieldName?: string;
	BeforeValue?: string;
	AfterValue?: string;
};

function getFieldChanges(entry: AuditLogEntry): AuditFieldChangeLike[] {
	const changes = (entry as any).Changes;
	if (!changes) return [];
	if (Array.isArray(changes)) return changes as AuditFieldChangeLike[];

	const wrapped = changes.Change ?? changes.change;
	if (!wrapped) return [];
	const fieldChanges =
		wrapped.case === 'FieldChanges' ||
		wrapped.case === 'fieldChanges'
			? wrapped.value?.Fields ?? wrapped.value?.fields ?? []
			: [];
	return Array.isArray(fieldChanges)
		? (fieldChanges as AuditFieldChangeLike[])
		: [];
}

const hasChanges = (entry: AuditLogEntry) => getFieldChanges(entry).length > 0;

function AuditLogChangeDetails({ entry }: { entry: AuditLogEntry }) {
	const fields = getFieldChanges(entry);
	if (!fields.length) return null;
	return (
		<div className='space-y-2'>
			{fields.map((field, idx) => (
				<div
					key={`${field.FieldName}-${idx}`}
					className='grid gap-3 rounded-md border p-3 md:grid-cols-3'
				>
					<div className='font-medium'>{field.FieldName || '-'}</div>
					<div>
						<div className='text-muted-foreground mb-1 text-xs uppercase'>
							Before
						</div>
						<pre className='whitespace-pre-wrap break-words text-xs'>
							{field.BeforeValue || '-'}
						</pre>
					</div>
					<div>
						<div className='text-muted-foreground mb-1 text-xs uppercase'>
							After
						</div>
						<pre className='whitespace-pre-wrap break-words text-xs'>
							{field.AfterValue || '-'}
						</pre>
					</div>
				</div>
			))}
		</div>
	);
}

const fmtDate = (value?: AuditLogEntry['CreatedOnUTC']) => {
	const d = tsToDate(value);
	return d ? d.toLocaleString() : '-';
};

export const auditLogColumns: ColumnDef<AuditLogEntry>[] = [
	{
		accessorKey: 'CreatedOnUTC',
		id: 'CreatedOnUTC',
		header: 'Created',
		cell: ({ row }) => fmtDate(row.original.CreatedOnUTC),
	},
	{
		accessorKey: 'Action',
		id: 'Action',
		header: () => (
			<Button type='button' variant='ghost'>
				Action
			</Button>
		),
		cell: ({ row }) => {
			const display = row.getValue<ActionType>('Action');
			return (
				<div className='flex min-w-0 flex-col'>
					<span className='truncate'>{display}</span>
				</div>
			);
		},
	},
	{
		accessorKey: 'Summary',
		id: 'Summary',
		header: 'Summary',
		cell: ({ row }) => (
			<span className='line-clamp-2'>{row.original.Summary || '-'}</span>
		),
	},
	{
		accessorKey: 'Reason',
		id: 'Reason',
		header: 'Reason',
		cell: ({ row }) => (
			<span className='line-clamp-2'>{row.original.Reason || '-'}</span>
		),
	},
	{
		accessorKey: 'ContextName',
		id: 'ContextName',
		header: 'Context',
		cell: ({ row }) => row.original.ContextName || '-',
	},
	{
		accessorKey: 'Actor',
		id: 'Actor',
		header: 'Actor',
		cell: ({ row }) =>
			row.original.Actor?.DisplayName ||
			row.original.Actor?.UserName ||
			'-',
	},
	{
		accessorKey: 'Targets',
		id: 'Targets',
		header: 'Targets',
		cell: ({ row }) => row.original.Targets?.length ?? 0,
	},
];

export function AuditLogTable({ data, loading }: Props) {
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

	const table = useReactTable({
		data,
		columns: auditLogColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const toggleExpanded = (key: string) => {
		setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<div>
			<div className='overflow-auto rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								<TableHead className='w-20'>Changes</TableHead>
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
							<TableRow>
								<TableCell
									colSpan={auditLogColumns.length + 1}
									className='h-24 text-center'
								>
									Loading...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => {
								const entry = row.original;
								const rowKey = entry.EntryID || row.id;
								const canExpand = hasChanges(entry);
								const isExpanded = !!expandedRows[rowKey];

								return (
									<Fragment key={row.id}>
										<TableRow>
											<TableCell className='w-20 align-top'>
												{canExpand ? (
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() =>
															toggleExpanded(
																rowKey,
															)
														}
													>
														{isExpanded
															? 'Hide'
															: 'View'}
													</Button>
												) : (
													<span className='text-muted-foreground text-xs'>
														-
													</span>
												)}
											</TableCell>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef
															.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
										{isExpanded && canExpand && (
											<TableRow>
												<TableCell />
												<TableCell
													colSpan={
														auditLogColumns.length
													}
													className='bg-muted/20'
												>
													<AuditLogChangeDetails
														entry={entry}
													/>
												</TableCell>
											</TableRow>
										)}
									</Fragment>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={auditLogColumns.length + 1}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

'use client';

import * as React from 'react';
import { create } from '@bufbuild/protobuf';
import { useRouter } from 'next/navigation';
import {
	ColumnDef,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from '@/components/ui/empty';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type {
	CommentResponseRecord,
	GetCommentsResponse,
} from '@inverted-tech/fragments/Comment';
import { CreateCommentForContentForm } from '@/components/forms/create-comment-for-content-form';
import { CreateCommentForCommentForm } from '@/components/forms/create-comment-for-comment-form';
import {
	deleteComment,
	getCommentsForComment,
	likeComment,
	pinComment,
	undeleteComment,
	unlikeComment,
	unpinComment,
} from '@/app/actions/comments';
import {
	AdminDeleteCommentRequestSchema,
	AdminPinCommentRequestSchema,
	AdminUnDeleteCommentRequestSchema,
	AdminUnPinCommentRequestSchema,
	GetCommentsForCommentRequestSchema,
	LikeCommentRequestSchema,
	UnLikeCommentRequestSchema,
} from '@inverted-tech/fragments/Comment';

type MaybeTimestamp = unknown;

function toJsDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;

	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}

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
			const d = new Date(sNum * 1000 + Math.floor(nNum / 1_000_000));
			return Number.isNaN(d.getTime()) ? undefined : d;
		}
	}

	return undefined;
}

function fmtDate(input?: MaybeTimestamp) {
	const d = input ? toJsDate(input) : undefined;
	return d ? d.toLocaleString() : 'N/A';
}

function ViewRepliesDialogButton({ commentId }: { commentId: string }) {
	const [open, setOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [records, setRecords] = React.useState<CommentResponseRecord[]>([]);
	const [loadedOnce, setLoadedOnce] = React.useState(false);

	const loadReplies = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await getCommentsForComment(
				create(GetCommentsForCommentRequestSchema, {
					ParentCommentID: commentId,
					PageOffset: 0,
					PageSize: 100,
				}),
			);
			setRecords(res?.Records ?? []);
		} catch (e) {
			console.error(e);
			setError('Failed to load replies.');
			setRecords([]);
		} finally {
			setLoading(false);
			setLoadedOnce(true);
		}
	}, [commentId]);

	const handleOpenChange = React.useCallback(
		(nextOpen: boolean) => {
			setOpen(nextOpen);
			if (nextOpen && !loadedOnce) {
				void loadReplies();
			}
		},
		[loadReplies, loadedOnce],
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type='button' variant='outline' size='sm'>
					View Replies
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Replies</DialogTitle>
					<DialogDescription>
						Replies for comment ID: {commentId}
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-3'>
					<div className='flex justify-end'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => void loadReplies()}
							disabled={loading}
						>
							Refresh
						</Button>
					</div>
					{loading ? (
						<div className='space-y-2'>
							<Skeleton className='h-16 w-full' />
							<Skeleton className='h-16 w-full' />
						</div>
					) : error ? (
						<p className='text-sm text-destructive'>{error}</p>
					) : records.length === 0 ? (
						<p className='text-muted-foreground text-sm'>
							No replies found.
						</p>
					) : (
						<div className='space-y-2'>
							{records.map((reply) => (
								<div
									key={reply.CommentID}
									className='rounded-md border p-3'
								>
									<div className='mb-1 flex flex-wrap items-center gap-2 text-sm'>
										<span className='font-medium'>
											{reply.UserDisplayName ||
												reply.UserName ||
												'N/A'}
										</span>
										<span className='text-muted-foreground'>
											@{reply.UserName || 'N/A'}
										</span>
										<span className='text-muted-foreground'>
											{fmtDate(reply.CreatedOnUTC)}
										</span>
									</div>
									<p className='text-sm'>
										{reply.CommentText || 'N/A'}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function CommentActions({ comment }: { comment: CommentResponseRecord }) {
	const router = useRouter();
	const [pendingAction, setPendingAction] = React.useState<string | null>(null);
	const isPinned = Boolean(comment.PinnedOnUTC);
	const isDeleted = Boolean(comment.DeletedOnUTC);
	const isLiked = Boolean(comment.LikedByUser);

	const runAction = React.useCallback(
		async (key: string, fn: () => Promise<unknown>) => {
			if (pendingAction) return;
			setPendingAction(key);
			try {
				await fn();
				router.refresh();
			} catch (error) {
				console.error(error);
			} finally {
				setPendingAction(null);
			}
		},
		[pendingAction, router],
	);

	return (
		<div className='flex items-center gap-2'>
			<ViewRepliesDialogButton commentId={comment.CommentID} />
			<Dialog>
				<DialogTrigger asChild>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={(event) => event.stopPropagation()}
					>
						Reply
					</Button>
				</DialogTrigger>
				<DialogContent
					className='max-h-[85vh] overflow-y-auto sm:max-w-xl'
					onClick={(event) => event.stopPropagation()}
				>
					<DialogHeader>
						<DialogTitle>Reply to comment</DialogTitle>
						<DialogDescription>
							Add a nested reply for this comment thread.
						</DialogDescription>
					</DialogHeader>
					<CreateCommentForCommentForm parentCommentId={comment.CommentID} />
				</DialogContent>
			</Dialog>

			<Button
				type='button'
				variant='outline'
				size='sm'
				disabled={Boolean(pendingAction)}
				onClick={(event) => {
					event.stopPropagation();
					void runAction('pin', async () => {
						if (isPinned) {
							await unpinComment(
								create(AdminUnPinCommentRequestSchema, {
									CommentID: comment.CommentID,
								}),
							);
							return;
						}
						await pinComment(
							create(AdminPinCommentRequestSchema, {
								CommentID: comment.CommentID,
							}),
						);
					});
				}}
			>
				{isPinned ? 'Unpin' : 'Pin'}
			</Button>

			<Button
				type='button'
				variant='outline'
				size='sm'
				disabled={Boolean(pendingAction)}
				onClick={(event) => {
					event.stopPropagation();
					void runAction('delete', async () => {
						if (isDeleted) {
							await undeleteComment(
								create(AdminUnDeleteCommentRequestSchema, {
									CommentID: comment.CommentID,
								}),
							);
							return;
						}
						await deleteComment(
							create(AdminDeleteCommentRequestSchema, {
								CommentID: comment.CommentID,
							}),
						);
					});
				}}
			>
				{isDeleted ? 'Undelete' : 'Delete'}
			</Button>

			<Button
				type='button'
				variant='outline'
				size='sm'
				disabled={Boolean(pendingAction) || isDeleted}
				onClick={(event) => {
					event.stopPropagation();
					void runAction('like', async () => {
						if (isLiked) {
							await unlikeComment(
								create(UnLikeCommentRequestSchema, {
									CommentID: comment.CommentID,
								}),
							);
							return;
						}
						await likeComment(
							create(LikeCommentRequestSchema, {
								CommentID: comment.CommentID,
							}),
						);
					});
				}}
			>
				{isLiked ? 'Unlike' : 'Like'}
			</Button>
		</div>
	);
}

function getColumns(): ColumnDef<CommentResponseRecord>[] {
	return [
		{
			id: 'UserDisplayName',
			accessorFn: (r) => r.UserDisplayName || r.UserName || '',
			header: ({ column }) => (
				<Button
					type='button'
					variant='ghost'
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === 'asc')
					}
				>
					User <ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			),
			cell: ({ row }) => (
				<div className='flex min-w-0 flex-col'>
					<span className='truncate'>
						{row.original.UserDisplayName ||
							row.original.UserName ||
							'N/A'}
					</span>
					<span className='text-muted-foreground truncate text-xs'>
						@{row.original.UserName || 'N/A'}
					</span>
				</div>
			),
		},
		{
			id: 'CommentText',
			accessorKey: 'CommentText',
			header: 'Comment',
			cell: ({ row }) => (
				<div className='max-w-xl truncate'>
					{row.original.CommentText || 'N/A'}
				</div>
			),
		},
		{
			id: 'CreatedOnUTC',
			accessorFn: (r) => toJsDate(r.CreatedOnUTC)?.getTime() ?? 0,
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
		},
		{
			id: 'Likes',
			accessorKey: 'Likes',
			header: ({ column }) => (
				<Button
					type='button'
					variant='ghost'
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === 'asc')
					}
					className='ml-auto'
				>
					Likes <ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			),
			cell: ({ row }) => (
				<div className='text-right tabular-nums'>
					{row.original.Likes}
				</div>
			),
		},
		{
			id: 'NumReplies',
			accessorKey: 'NumReplies',
			header: ({ column }) => (
				<Button
					type='button'
					variant='ghost'
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === 'asc')
					}
					className='ml-auto'
				>
					Replies <ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			),
			cell: ({ row }) => (
				<div className='text-right tabular-nums'>
					{row.original.NumReplies}
				</div>
			),
		},
		{
			id: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const comment = row.original;
				const statuses: Array<{
					label: string;
					variant: 'secondary' | 'outline';
				}> = [];

				if (comment.DeletedOnUTC)
					statuses.push({ label: 'Deleted', variant: 'secondary' });
				if (comment.PinnedOnUTC)
					statuses.push({ label: 'Pinned', variant: 'outline' });
				if (comment.ModifiedOnUTC && !comment.DeletedOnUTC) {
					statuses.push({ label: 'Edited', variant: 'outline' });
				}
				if (!statuses.length)
					statuses.push({ label: 'Active', variant: 'outline' });

				return (
					<div className='flex flex-wrap gap-1'>
						{statuses.map((status) => (
							<Badge key={status.label} variant={status.variant}>
								{status.label}
							</Badge>
						))}
					</div>
				);
			},
			enableSorting: false,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => <CommentActions comment={row.original} />,
			enableSorting: false,
		},
	];
}

export function CommentsTable({
	contentId,
	response,
	pageSize = 25,
	loading = false,
	skeletonRows = 8,
	onPrevPage,
	onNextPage,
	hasPrev,
	hasNext,
	filterButton,
	onRowClick,
}: {
	contentId?: string;
	response?: GetCommentsResponse;
	pageSize?: number;
	loading?: boolean;
	skeletonRows?: number;
	onPrevPage?: () => void;
	onNextPage?: () => void;
	hasPrev?: boolean;
	hasNext?: boolean;
	filterButton?: React.ReactNode;
	onRowClick?: (comment: CommentResponseRecord) => void;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const columns = React.useMemo(() => getColumns(), []);
	const data = response?.Records ?? [];
	const isEmpty = !loading && data.length === 0;
	const table = useReactTable({
		data,
		columns,
		getRowId: (row) => row.CommentID,
		state: { sorting, columnVisibility },
		initialState: { pagination: { pageSize } },
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	React.useEffect(() => {
		if (pageSize && table.getState().pagination.pageSize !== pageSize) {
			table.setPageSize(pageSize);
		}
	}, [pageSize, table]);

	return (
		<div>
			<div className='flex justify-end gap-2 py-2'>
				{contentId ? (
					<Dialog>
						<DialogTrigger asChild>
							<Button type='button'>Create Comment</Button>
						</DialogTrigger>
						<DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-xl'>
							<DialogHeader>
								<DialogTitle>Create comment</DialogTitle>
								<DialogDescription>
									Post a new top-level comment for this
									content.
								</DialogDescription>
							</DialogHeader>
							<CreateCommentForContentForm
								contentId={contentId}
							/>
						</DialogContent>
					</Dialog>
				) : null}
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

			{isEmpty ? (
				<Empty className='border'>
					<EmptyHeader>
						<EmptyTitle>No comments</EmptyTitle>
						<EmptyDescription>
							No comments were returned for this query.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
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
							{loading
								? Array.from({ length: skeletonRows }).map(
										(_, rowIdx) => (
											<TableRow
												key={`skeleton-${rowIdx}`}
											>
												{table
													.getVisibleLeafColumns()
													.map((col, colIdx) => (
														<TableCell
															key={`${col.id}-${colIdx}`}
														>
															{colIdx === 0 ? (
																<div className='flex min-w-0 flex-col gap-1'>
																	<Skeleton className='h-4 w-40' />
																	<Skeleton className='h-3 w-20' />
																</div>
															) : col.id ===
															  'status' ? (
																<Skeleton className='h-5 w-20 rounded-full' />
															) : (
																<Skeleton className='h-4 w-28' />
															)}
														</TableCell>
													))}
											</TableRow>
										),
									)
								: table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											className={
												onRowClick
													? 'cursor-pointer hover:bg-muted/50'
													: undefined
											}
											onClick={
												onRowClick
													? () =>
															onRowClick(
																row.original,
															)
													: undefined
											}
										>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												))}
										</TableRow>
									))}
						</TableBody>
					</Table>
				</div>
			)}

			<div className='mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
				<div className='text-muted-foreground text-sm'>
					{loading
						? 'Loading...'
						: typeof response?.PageTotalItems === 'number'
							? response.PageTotalItems === 0
								? '0 of 0'
								: `${response.PageOffsetStart + 1}-${response.PageOffsetEnd} of ${response.PageTotalItems}`
							: `${table.getRowModel().rows.length} shown.`}
				</div>
				<div className='flex gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onPrevPage}
						disabled={loading || !hasPrev}
					>
						Previous
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onNextPage}
						disabled={loading || !hasNext}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

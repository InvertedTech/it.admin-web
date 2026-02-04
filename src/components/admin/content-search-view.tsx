'use client';

import * as React from 'react';
import { ContentListRecord } from '@inverted-tech/fragments/Content';
import {
	ContentTable,
	ContentTypeLabels,
	levelLabel,
} from '@/components/tables/content-table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const typeOptions = Object.entries(ContentTypeLabels).map(([key, label]) => ({
	value: Number(key),
	label,
}));

const accessOptions = [
	{ value: 0, label: levelLabel(0) },
	{ value: 1, label: levelLabel(1) },
	{ value: 2, label: levelLabel(2) },
];

export function ContentSearchView({
	data,
}: {
	data: ContentListRecord[];
}) {
	const [titleQuery, setTitleQuery] = React.useState('');
	const [authorQuery, setAuthorQuery] = React.useState('');
	const [typeFilters, setTypeFilters] = React.useState<number[]>([]);
	const [accessFilters, setAccessFilters] = React.useState<number[]>([]);
	const [pageSize, setPageSize] = React.useState<number>(25);

	const filtered = React.useMemo(() => {
		const titleQ = titleQuery.trim().toLowerCase();
		const authorQ = authorQuery.trim().toLowerCase();
		return (data ?? []).filter((row) => {
			const title = String(row.Title ?? '').toLowerCase();
			const author = String(row.Author ?? '').toLowerCase();
			const matchTitle = !titleQ || title.includes(titleQ);
			const matchAuthor = !authorQ || author.includes(authorQ);
			const matchType =
				typeFilters.length === 0 ||
				typeFilters.includes(Number(row.ContentType ?? 0));
			const matchAccess =
				accessFilters.length === 0 ||
				accessFilters.includes(Number(row.SubscriptionLevel ?? 0));
			return matchTitle && matchAuthor && matchType && matchAccess;
		});
	}, [data, titleQuery, authorQuery, typeFilters, accessFilters]);

	const resetFilters = () => {
		setTitleQuery('');
		setAuthorQuery('');
		setTypeFilters([]);
		setAccessFilters([]);
	};

	return (
		<form className='space-y-4'>
			<div className='border-b pb-3'>
				<div className='grid gap-2 md:grid-cols-2'>
					<Input
						placeholder='Search title...'
						value={titleQuery}
						onChange={(e) => setTitleQuery(e.target.value)}
					/>
					<Input
						placeholder='Search author...'
						value={authorQuery}
						onChange={(e) => setAuthorQuery(e.target.value)}
					/>
				</div>
			</div>

			<details className='rounded border p-3 [&>summary]:cursor-pointer'>
				<summary className='text-sm text-muted-foreground'>
					Advanced filters
				</summary>
				<div className='mt-3 grid gap-4 md:grid-cols-2'>
					<div className='space-y-2'>
						<div className='text-sm font-medium'>Content types</div>
						<div className='grid grid-cols-2 gap-2'>
							{typeOptions.map((opt) => (
								<label
									key={opt.value}
									className='flex items-center gap-2 text-sm'
								>
									<Checkbox
										checked={typeFilters.includes(opt.value)}
										onCheckedChange={(v) => {
											setTypeFilters((prev) =>
												Boolean(v)
													? prev.includes(opt.value)
														? prev
														: [...prev, opt.value]
													: prev.filter(
															(x) => x !== opt.value,
													  ),
											);
										}}
									/>
									<span>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
					<div className='space-y-2'>
						<div className='text-sm font-medium'>Access level</div>
						<div className='grid grid-cols-2 gap-2'>
							{accessOptions.map((opt) => (
								<label
									key={opt.value}
									className='flex items-center gap-2 text-sm'
								>
									<Checkbox
										checked={accessFilters.includes(opt.value)}
										onCheckedChange={(v) => {
											setAccessFilters((prev) =>
												Boolean(v)
													? prev.includes(opt.value)
														? prev
														: [...prev, opt.value]
													: prev.filter(
															(x) => x !== opt.value,
													  ),
											);
										}}
									/>
									<span>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
				</div>
				<div className='mt-4 flex justify-end gap-2'>
					<Button
						type='button'
						variant='outline'
						onClick={resetFilters}
					>
						Reset filters
					</Button>
				</div>
			</details>

			<div className='flex justify-end'>
				<div className='flex items-center gap-2 text-sm text-muted-foreground'>
					<span>Rows per page</span>
					<Select
						value={String(pageSize)}
						onValueChange={(v) => setPageSize(Number(v))}
					>
						<SelectTrigger className='h-8 w-[88px]'>
							<SelectValue placeholder='25' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='10'>10</SelectItem>
							<SelectItem value='25'>25</SelectItem>
							<SelectItem value='50'>50</SelectItem>
							<SelectItem value='100'>100</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<ContentTable data={filtered} pageSize={pageSize} />
		</form>
	);
}

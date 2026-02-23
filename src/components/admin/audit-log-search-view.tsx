'use client';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { AuditLogEntry } from '@inverted-tech/fragments/AuditLog';
import { AuditLogTable } from '../tables/audit-log-table';
import { Skeleton } from '../ui/skeleton';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
type Props = {
	pageSize?: number;
	pageOffset?: number;
	pageTotalItems?: number;
	data?: AuditLogEntry[];
};

function AuditLogTableSkeleton() {
	return (
		<div className='space-y-2'>
			<Skeleton className='h-10 w-full' />
			<Skeleton className='h-12 w-full' />
			<Skeleton className='h-12 w-full' />
			<Skeleton className='h-12 w-full' />
			<Skeleton className='h-12 w-full' />
			<Skeleton className='h-12 w-full' />
		</div>
	);
}

export function AuditLogSearchView({
	pageSize = 25,
	pageOffset = 0,
	pageTotalItems = 0,
	data = [],
}: Props) {
	const router = useRouter();

	const canPrev = pageOffset > 0;
	const canNext = pageOffset + data.length < pageTotalItems;

	const nextPage = () => {
		const nextOffset = pageOffset + pageSize;
		router.push(`/audit-log?PageSize=${pageSize}&PageOffset=${nextOffset}`);
	};

	const prevPage = () => {
		const prevOffset = Math.max(0, pageOffset - pageSize);
		router.push(`/audit-log?PageSize=${pageSize}&PageOffset=${prevOffset}`);
	};

	const setPageSize = (value: string) => {
		router.push(`/audit-log?PageSize=${value}&PageOffset=0`);
	};

	return (
		<>
			<div className='flex items-center justify-end'>
				<Select value={`${pageSize}`} onValueChange={setPageSize}>
					<SelectTrigger className='w-36' id='audit-log-page-size'>
						<SelectValue placeholder='Page size' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='10'>10</SelectItem>
						<SelectItem value='25'>25</SelectItem>
						<SelectItem value='50'>50</SelectItem>
						<SelectItem value='100'>100</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<Suspense fallback={<AuditLogTableSkeleton />}>
				<AuditLogTable data={data} />
			</Suspense>
			<div className='flex items-center justify-end gap-2 py-4'>
				<Button
					variant='outline'
					size='sm'
					onClick={prevPage}
					disabled={!canPrev}
				>
					Previous
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={nextPage}
					disabled={!canNext}
				>
					Next
				</Button>
			</div>
		</>
	);
}

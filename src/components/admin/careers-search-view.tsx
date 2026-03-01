'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { create } from '@bufbuild/protobuf';
import { AdminListCareersRequestSchema } from '@inverted-tech/fragments/Careers';
import type { CareerListRecord } from '@inverted-tech/fragments/Careers';
import { listCareers } from '@/app/actions/careers';
import { CareersTable } from '@/components/tables/careers-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { CareersFiltersButton } from '@/components/forms/groups/careers/careers-search-field-groups';

type Props = {
	pageSize?: number;
	pageOffset?: number;
	includeDeleted?: boolean;
};

export function CareersSearchView({
	pageSize = 25,
	pageOffset = 0,
	includeDeleted = false,
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [data, setData] = React.useState<CareerListRecord[]>([]);
	const [total, setTotal] = React.useState(0);
	const [offset, setOffset] = React.useState(pageOffset);
	const [size, setSize] = React.useState(pageSize);
	const [loading, setLoading] = React.useState(false);

	const form = useProtoAppForm({
		schema: AdminListCareersRequestSchema,
		defaultValues: create(AdminListCareersRequestSchema, {
			PageSize: pageSize,
			PageOffset: pageOffset,
			IncludeDeleted: includeDeleted,
		}),
		onValidSubmit: async ({ value }) => {
			setLoading(true);
			try {
				const res = await listCareers(value);
				setData(res.Careers ?? []);
				setTotal(res.PageTotalItems ?? res.Careers?.length ?? 0);
				setOffset(res.PageOffsetStart ?? value.PageOffset ?? 0);
				setSize(value.PageSize ?? pageSize);
				updateUrl(value.PageOffset ?? 0, value.PageSize ?? pageSize, value.IncludeDeleted ?? false);
			} finally {
				setLoading(false);
			}
		},
	});

	function updateUrl(newOffset: number, newSize: number, newIncludeDeleted: boolean) {
		const params = new URLSearchParams(searchParams?.toString());
		params.set('PageSize', String(newSize));
		params.set('PageOffset', String(newOffset));
		params.set('IncludeDeleted', String(newIncludeDeleted));
		router.replace(`${pathname}?${params.toString()}`);
	}

	React.useEffect(() => {
		form.handleSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const canPrev = offset > 0;
	const canNext = offset + data.length < total;

	const nextPage = () => {
		const effectiveSize = Number(form.getFieldValue('PageSize' as any) ?? size) || size;
		const newOffset = offset + effectiveSize;
		form.setFieldValue('PageOffset' as any, newOffset);
		setOffset(newOffset);
		form.handleSubmit();
	};

	const prevPage = () => {
		const effectiveSize = Number(form.getFieldValue('PageSize' as any) ?? size) || size;
		const newOffset = Math.max(0, offset - effectiveSize);
		form.setFieldValue('PageOffset' as any, newOffset);
		setOffset(newOffset);
		form.handleSubmit();
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.setFieldValue('PageOffset' as any, 0);
				setOffset(0);
				form.handleSubmit();
			}}
			className='space-y-4'
		>
			<form.AppForm>
				<CareersTable
					data={data}
					loading={loading}
					skeletonRows={size}
					onPrevPage={prevPage}
					onNextPage={nextPage}
					hasPrev={canPrev}
					hasNext={canNext}
					filterButton={
						<>
							<CareersFiltersButton />
							<Button asChild size='sm'>
								<Link href='/careers/create'>Create Career</Link>
							</Button>
						</>
					}
				/>
			</form.AppForm>
		</form>
	);
}

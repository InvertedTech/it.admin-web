// src/app/(dashboard)/users/_components/users-search-view.tsx
'use client';
import * as React from 'react';
import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';
import type { UserSearchRecord } from '@inverted-tech/fragments/Authentication';
import {
	AdminSearchUsersSearchBarFieldGroup,
	AdminSearchUsersFiltersFieldGroup,
	AdminSearchUsersPagingFieldGroup,
} from '../forms/groups/admin/admin-search-users-field-group';
import { UsersTable } from '../tables/users-table';
import { listUsers } from '@/app/actions/auth';

export function UsersSearchView() {
	const [loading, setLoading] = React.useState(false);
	const form = useProtoAppForm({
		schema: SearchUsersAdminRequestSchema,
		defaultValues: create(SearchUsersAdminRequestSchema, {
			PageSize: 25,
			PageOffset: 0,
		}),
		onValidSubmit: async ({ value }) => {
			setLoading(true);
			try {
				const res = await listUsers(value);
				setData(res.Records ?? []);
				setTotal(res.PageTotalItems ?? res.Records?.length ?? 0);
				setOffset(res.PageOffsetStart ?? value.PageOffset ?? 0);
				setSize(value.PageSize ?? 25);
			} finally {
				setLoading(false);
			}
		},
	});

	const [data, setData] = React.useState<UserSearchRecord[]>([]);
	const [total, setTotal] = React.useState<number>(0);
	const [offset, setOffset] = React.useState<number>(0);
	const [size, setSize] = React.useState<number>(25);

	React.useEffect(() => {
		form.handleSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// PageSize bridge without baseStore.subscribe
	function PageSizeEffect({ pageSize }: { pageSize?: number }) {
		const prev = React.useRef<number | undefined>(pageSize);
		React.useEffect(() => {
			if (
				typeof pageSize === 'number' &&
				pageSize > 0 &&
				pageSize !== prev.current
			) {
				prev.current = pageSize;
				form.setFieldValue('PageOffset' as any, 0);
				setOffset(0);
				setSize(pageSize);
				form.handleSubmit();
			}
		}, [pageSize]);
		return null;
	}

	const canPrev = offset > 0;
	const canNext = offset + data.length < total;

	const nextPage = () => {
		const newOffset = offset + size;
		form.setFieldValue('PageOffset' as any, newOffset);
		setOffset(newOffset);
		form.handleSubmit();
	};
	const prevPage = () => {
		const newOffset = Math.max(0, offset - size);
		form.setFieldValue('PageOffset' as any, newOffset);
		setOffset(newOffset);
		form.handleSubmit();
	};

	const FIELDS = {
		$typeName: '$typeName',
		PageSize: 'PageSize',
		PageOffset: 'PageOffset',
		UserIDs: 'UserIDs',
		SearchString: 'SearchString',
		Roles: 'Roles',
		CreatedAfter: 'CreatedAfter',
		CreatedBefore: 'CreatedBefore',
		IncludeDeleted: 'IncludeDeleted',
	} as const;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.AppForm>
				<div className="border-b pb-3">
					<AdminSearchUsersSearchBarFieldGroup
						form={form}
						fields={FIELDS as any}
					/>
				</div>

				<details className="rounded border p-3 [&>summary]:cursor-pointer">
					<summary className="text-sm text-muted-foreground">
						Advanced filters
					</summary>
					<div className="mt-3">
						<AdminSearchUsersFiltersFieldGroup
							form={form}
							fields={FIELDS as any}
						/>
					</div>
				</details>

				<div className="flex justify-end">
					<AdminSearchUsersPagingFieldGroup
						form={form}
						fields={FIELDS as any}
					/>
				</div>

				{/* Watch PageSize via Subscribe */}
				<form.Subscribe selector={(s: any) => s?.values?.PageSize}>
					{(pageSize?: number) => <PageSizeEffect pageSize={pageSize} />}
				</form.Subscribe>

				<UsersTable
					data={data}
					loading={loading}
					skeletonRows={size}
					onPrevPage={prevPage}
					onNextPage={nextPage}
					hasPrev={canPrev}
					hasNext={canNext}
				/>
			</form.AppForm>
		</form>
	);
}

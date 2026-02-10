// src/app/(dashboard)/users/_components/users-search-view.tsx
'use client';
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { create } from '@bufbuild/protobuf';
import { timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	SearchUsersAdminRequest,
	SearchUsersAdminRequestSchema,
} from '@inverted-tech/fragments/Authentication';
import type { UserSearchRecord } from '@inverted-tech/fragments/Authentication';
import {
	AdminSearchUsersSearchBarFieldGroup,
	UsersFiltersButton,
	type RoleOption,
} from '../forms/groups/admin/admin-search-users-field-group';
import { UsersTable } from '../tables/users-table';
import { listUsers } from '@/app/actions/auth';
import { RoleMeta, Roles as AllRoles } from '@/lib/types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type Props = {
	pageSize?: number;
	pageOffset?: number;
	searchString?: string;
	includeDeleted?: boolean;
	roles?: string[];
	userIDs?: string[];
	createdAfter?: string;
	createdBefore?: string;
};

const ROLE_OPTIONS: RoleOption[] = AllRoles.map((role) => ({
	DisplayName: RoleMeta[role]?.label ?? role,
	RoleValue: role,
}));

function parseTimestampInput(value?: string) {
	if (!value || !value.trim()) return undefined;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return undefined;
	return timestampFromDate(d);
}

function timestampToIso(value: unknown) {
	if (!value) return '';
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? '' : d.toISOString();
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		'seconds' in (value as any)
	) {
		try {
			return timestampDate(value as any).toISOString();
		} catch {
			return '';
		}
	}
	return '';
}

export function UsersSearchView({
	pageSize = 25,
	pageOffset = 0,
	searchString = '',
	includeDeleted = false,
	roles = [],
	userIDs = [],
	createdAfter = '',
	createdBefore = '',
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [loading, setLoading] = React.useState(false);
	const createdAfterTs = React.useMemo(
		() => parseTimestampInput(createdAfter),
		[createdAfter],
	);
	const createdBeforeTs = React.useMemo(
		() => parseTimestampInput(createdBefore),
		[createdBefore],
	);
	const form = useProtoAppForm({
		schema: SearchUsersAdminRequestSchema,
		defaultValues: create(SearchUsersAdminRequestSchema, {
			PageSize: pageSize,
			PageOffset: pageOffset,
			SearchString: searchString,
			IncludeDeleted: includeDeleted,
			Roles: roles,
			UserIDs: userIDs,
			CreatedAfter: createdAfterTs,
			CreatedBefore: createdBeforeTs,
		}),
		onValidSubmit: async ({ value }) => {
			setLoading(true);
			try {
				const res = await listUsers(value);
				setData(res.Records ?? []);
				setTotal(res.PageTotalItems ?? res.Records?.length ?? 0);
				setOffset(res.PageOffsetStart ?? value.PageOffset ?? 0);
				setSize(value.PageSize ?? pageSize);
				updateUrl(value);
			} finally {
				setLoading(false);
			}
		},
	});

	const [data, setData] = React.useState<UserSearchRecord[]>([]);
	const [total, setTotal] = React.useState<number>(0);
	const [offset, setOffset] = React.useState<number>(pageOffset);
	const [size, setSize] = React.useState<number>(pageSize);

	function updateUrl(value: SearchUsersAdminRequest) {
		const params = new URLSearchParams(searchParams?.toString());
		params.set('PageSize', String(value.PageSize ?? pageSize));
		params.set('PageOffset', String(value.PageOffset ?? pageOffset));

		const search = value.SearchString?.trim();
		if (search) params.set('SearchString', search);
		else params.delete('SearchString');

		if (typeof value.IncludeDeleted === 'boolean') {
			params.set('IncludeDeleted', value.IncludeDeleted ? '1' : '0');
		} else {
			params.delete('IncludeDeleted');
		}

		params.delete('Roles');
		for (const role of value.Roles ?? []) {
			if (role) params.append('Roles', role);
		}

		params.delete('UserIDs');
		for (const id of value.UserIDs ?? []) {
			if (id) params.append('UserIDs', id);
		}

		const createdAfterValue = (value as any)?.CreatedAfter;
		const createdBeforeValue = (value as any)?.CreatedBefore;
		const createdAfterIso = timestampToIso(createdAfterValue);
		const createdBeforeIso = timestampToIso(createdBeforeValue);
		if (createdAfterIso) {
			params.set('CreatedAfter', createdAfterIso);
		} else {
			params.delete('CreatedAfter');
		}
		if (createdBeforeIso) {
			params.set('CreatedBefore', createdBeforeIso);
		} else {
			params.delete('CreatedBefore');
		}

		router.replace(`${pathname}?${params.toString()}`);
	}

	function syncIncludeDeletedUrl(value: boolean | undefined) {
		const params = new URLSearchParams(searchParams?.toString());
		if (typeof value === 'boolean') {
			params.set('IncludeDeleted', value ? '1' : '0');
		} else {
			params.delete('IncludeDeleted');
		}
		router.replace(`${pathname}?${params.toString()}`);
	}

	React.useEffect(() => {
		form.handleSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const canPrev = offset > 0;
	const canNext = offset + data.length < total;

	const nextPage = () => {
		const effectiveSize =
			Number(form.getFieldValue('PageSize') ?? size) || size;
		const newOffset = offset + effectiveSize;
		form.setFieldValue('PageOffset' as any, newOffset);
		setOffset(newOffset);
		form.handleSubmit();
	};
	const prevPage = () => {
		const effectiveSize =
			Number(form.getFieldValue('PageSize') ?? size) || size;
		const newOffset = Math.max(0, offset - effectiveSize);
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
				form.setFieldValue('PageOffset' as any, 0);
				setOffset(0);
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.AppForm>
				<form.Subscribe selector={(s: any) => s?.values?.IncludeDeleted}>
					{(includeDeletedValue?: boolean) => (
						<IncludeDeletedUrlEffect
							includeDeletedValue={includeDeletedValue}
							onChange={syncIncludeDeletedUrl}
						/>
					)}
				</form.Subscribe>

				<UsersTable
					data={data}
					loading={loading}
					skeletonRows={size}
					onPrevPage={prevPage}
					onNextPage={nextPage}
					hasPrev={canPrev}
					hasNext={canNext}
					filterButton={<UsersFiltersButton roles={ROLE_OPTIONS} />}
				/>
			</form.AppForm>
		</form>
	);
}

function IncludeDeletedUrlEffect({
	includeDeletedValue,
	onChange,
}: {
	includeDeletedValue?: boolean;
	onChange: (value: boolean | undefined) => void;
}) {
	const prev = React.useRef<boolean | undefined>(includeDeletedValue);
	React.useEffect(() => {
		if (includeDeletedValue !== prev.current) {
			prev.current = includeDeletedValue;
			onChange(includeDeletedValue);
		}
	}, [includeDeletedValue, onChange]);
	return null;
}

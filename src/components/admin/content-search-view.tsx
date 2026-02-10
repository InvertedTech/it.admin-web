'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
	ContentListRecord,
	ContentType,
	GetAllContentAdminRequestSchema,
} from '@inverted-tech/fragments/Content';
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
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { getAllContent } from '@/app/actions/content';
import {
	AdminContentFiltersFieldGroup,
	ContentFiltersButton,
} from '../forms/groups/content/content-search-field-groups';

const typeOptions = Object.entries(ContentTypeLabels).map(([key, label]) => ({
	value: Number(key),
	label,
}));

const accessOptions = [
	{ value: 0, label: levelLabel(0) },
	{ value: 1, label: levelLabel(1) },
	{ value: 2, label: levelLabel(2) },
];

type Props = {
	roles: string[];
	pageSize?: number;
	pageOffset?: number;
	minLevel?: number;
	maxLevel?: number;
	channelId?: string;
};

export function ContentSearchView({
	roles,
	pageSize = 25,
	pageOffset = 0,
	minLevel = 0,
	maxLevel = 9999,
	channelId = '',
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [loading, setLoading] = React.useState(false);
	const [data, setData] = React.useState<ContentListRecord[]>([]);
	const [size, setSize] = React.useState<number>(pageSize);
	const [offset, setOffset] = React.useState<number>(pageOffset);
	const [total, setTotal] = React.useState<number>(0);
	const [minimumLevel, setMinimumLevel] = React.useState(minLevel);
	const [maximumLevel, setMaximumLevel] = React.useState(maxLevel);
	const form = useProtoAppForm({
		schema: GetAllContentAdminRequestSchema,
		defaultValues: create(GetAllContentAdminRequestSchema, {
			PageSize: pageSize,
			PageOffset: pageOffset,
			ChannelId: channelId,
			SubscriptionSearch: {
				MinimumLevel: minLevel,
				MaximumLevel: maxLevel,
			},
		}),
		onValidSubmit: async ({ value }) => {
			setLoading(true);
			try {
				const res = await getAllContent(value);
				setData(res.Records ?? []);
				setTotal(res.PageTotalItems);
				setOffset(res.PageOffsetStart ?? value.PageOffset ?? 0);
				setSize(value.PageSize ?? pageSize);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
	});

	React.useEffect(() => {
		form.handleSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [titleQuery, setTitleQuery] = React.useState('');
	const [authorQuery, setAuthorQuery] = React.useState('');
	const [typeFilters, setTypeFilters] = React.useState<number[]>([]);
	const [accessFilters, setAccessFilters] = React.useState<number[]>([]);
	const [channelFilter, setChannelFilter] = React.useState(channelId);

	const updateUrl = React.useCallback(
		(next: {
			pageSize: number;
			pageOffset: number;
			minLevel: number;
			maxLevel: number;
			channelId?: string;
		}) => {
			const params = new URLSearchParams(searchParams?.toString());
			params.set('pageSize', String(next.pageSize));
			params.set('pageOffset', String(next.pageOffset));
			params.set('minLevel', String(next.minLevel));
			params.set('maxLevel', String(next.maxLevel));
			if (next.channelId && next.channelId.trim()) {
				params.set('channelId', next.channelId.trim());
			} else {
				params.delete('channelId');
			}
			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	function executeSearch(
		next: { nextOffset?: number; nextSize?: number } = {},
	) {
		const minFromFilters = Number(
			form.getFieldValue('SubscriptionSearch.MinimumLevel' as any) ?? minLevel,
		);
		const maxFromFilters = Number(
			form.getFieldValue('SubscriptionSearch.MaximumLevel' as any) ?? maxLevel,
		);
		const channelFromFilters = String(
			form.getFieldValue('ChannelId' as any) ?? '',
		).trim();
		const pageSizeFromFilters = Number(
			form.getFieldValue('PageSize' as any) ?? size,
		);
		const normalizedOffset = Math.max(0, next.nextOffset ?? offset);
		const normalizedSize = Math.max(1, next.nextSize ?? pageSizeFromFilters);
		const contentType =
			typeFilters.length === 1 ? (typeFilters[0] as ContentType) : 0;

		form.setFieldValue('PageOffset' as any, normalizedOffset);
		form.setFieldValue('PageSize' as any, normalizedSize);
		form.setFieldValue('ChannelId' as any, channelFromFilters);
		form.setFieldValue(
			'SubscriptionSearch.MinimumLevel' as any,
			minFromFilters,
		);
		form.setFieldValue(
			'SubscriptionSearch.MaximumLevel' as any,
			maxFromFilters,
		);
		form.setFieldValue('ContentType' as any, contentType);
		updateUrl({
			pageSize: normalizedSize,
			pageOffset: normalizedOffset,
			minLevel: minFromFilters,
			maxLevel: maxFromFilters,
			channelId: channelFromFilters,
		});
		form.handleSubmit();
	}

	const filteredData = React.useMemo(() => {
		const titleNeedle = titleQuery.trim().toLowerCase();
		const authorNeedle = authorQuery.trim().toLowerCase();
		return data.filter((item) => {
			const titleOk = titleNeedle
				? (item.Title ?? '').toLowerCase().includes(titleNeedle)
				: true;
			const authorOk = authorNeedle
				? (item.Author ?? '').toLowerCase().includes(authorNeedle)
				: true;
			const typeOk =
				typeFilters.length > 0 ? typeFilters.includes(item.ContentType) : true;
			const accessOk =
				accessFilters.length > 0
					? accessFilters.includes(item.SubscriptionLevel)
					: true;
			return titleOk && authorOk && typeOk && accessOk;
		});
	}, [accessFilters, authorQuery, data, titleQuery, typeFilters]);

	const resetFilters = () => {
		setTitleQuery('');
		setAuthorQuery('');
		setTypeFilters([]);
		setAccessFilters([]);
		setChannelFilter('');
		form.setFieldValue('PageOffset' as any, 0);
		setOffset(0);
		form.setFieldValue('ChannelId' as any, '');
		form.setFieldValue('SubscriptionSearch.MinimumLevel' as any, 0);
		form.setFieldValue('SubscriptionSearch.MaximumLevel' as any, 9999);
		form.setFieldValue('ContentType' as any, 0);
		updateUrl({
			pageSize: size,
			pageOffset: 0,
			minLevel: 0,
			maxLevel: 9999,
			channelId: '',
		});
		form.handleSubmit();
	};

	const canPrev = offset > 0;
	const canNext = offset + data.length < total;

	const FIELDS = {
		$typeName: '$typeName',
		PageSize: 'PageSize',
		PageOffset: 'PageOffset',
		SubscriptionSearch: 'SubscriptionSearch',
		'SubscriptionSearch.MinimumLevel': 'SubscriptionSearch.MinimumLevel',
		'SubscriptionSearch.MaximumLevel': 'SubscriptionSearch.MaximumLevel',
		Deleted: 'Deleted',
		OnlyLive: 'OnlyLive',
		ChannelId: 'ChannelId',
		CategoryId: 'CategoryId',
		ContentType: 'ContentType',
	};

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.setFieldValue('PageOffset' as any, 0);
				setOffset(0);
				executeSearch({ nextOffset: 0 });
			}}
		>
			<form.AppForm>
				<ContentTable
					data={filteredData}
					pageSize={size}
					roles={roles}
					loading={loading}
					totalItems={total}
					offsetStart={offset}
					hasPrev={canPrev}
					hasNext={canNext}
					filterButton={<ContentFiltersButton />}
					onPrevPage={() => {
						const nextOffset = Math.max(0, offset - size);
						setOffset(nextOffset);
						form.setFieldValue('PageOffset' as any, nextOffset);
						executeSearch({ nextOffset });
					}}
					onNextPage={() => {
						const nextOffset = offset + size;
						setOffset(nextOffset);
						form.setFieldValue('PageOffset' as any, nextOffset);
						executeSearch({ nextOffset });
					}}
				/>
			</form.AppForm>
		</form>
	);
}

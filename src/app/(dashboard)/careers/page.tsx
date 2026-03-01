'use server';

import { CareersSearchView } from '@/components/admin/careers-search-view';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher } from '@/lib/roleHelpers';

type SearchParams = {
	[key: string]: string | string[] | undefined;
};

function toSingle(v?: string | string[]) {
	return Array.isArray(v) ? v[0] : v;
}

function toInt(v: string | undefined, fallback: number) {
	if (!v) return fallback;
	const n = Number.parseInt(v, 10);
	return Number.isFinite(n) ? n : fallback;
}

function toBool(v: string | undefined, fallback: boolean) {
	if (!v) return fallback;
	if (v === 'true') return true;
	if (v === 'false') return false;

	return fallback;
}

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function CareersPage(props: Props) {
	const sp = (await props.searchParams) ?? {};
	const pageSize = toInt(toSingle(sp.PageSize), 25);
	const pageOffset = toInt(toSingle(sp.PageOffset), 0);
	const includeDeleted = toBool(toSingle(sp.IncludeDeleted), false);
	await requireRole(isAdminOrHigher);

	return (
		<div className='space-y-4'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>Careers</h1>
				<p className='text-muted-foreground mt-2'>
					Manage job listings and career postings.
				</p>
			</div>
			<CareersSearchView
				pageSize={pageSize}
				pageOffset={pageOffset}
				includeDeleted={includeDeleted}
			/>
		</div>
	);
}

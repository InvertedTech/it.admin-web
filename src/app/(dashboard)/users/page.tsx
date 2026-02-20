'use server';

import { UsersSearchView } from '@/components/admin/user-search-view';
import { getSession } from '@/lib/cookies';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher, isMemberManagerOrHigher } from '@/lib/roleHelpers';

type SearchParams = {
	[key: string]: string | string[] | undefined;
};

function toSingle(v?: string | string[]) {
	return Array.isArray(v) ? v[0] : v;
}

function toMulti(v?: string | string[]) {
	if (Array.isArray(v)) return v.filter(Boolean);
	if (typeof v === 'string' && v.trim()) return [v];
	return [];
}

function toInt(v: string | undefined, fallback: number) {
	if (!v) return fallback;
	const n = Number.parseInt(v, 10);
	return Number.isFinite(n) ? n : fallback;
}

type Props = {
	searchParams?: Promise<SearchParams>;
};

export default async function UsersSearchPage(props: Props) {
	const sp = (await props.searchParams) ?? {};
	const pageSize = toInt(toSingle(sp.PageSize), 25);
	const pageOffset = toInt(toSingle(sp.PageOffset), 0);
	const searchString = toSingle(sp.SearchString) ?? '';
	const includeDeletedRaw =
		toSingle(sp.IncludeDeleted) ?? toSingle(sp.includeDeleted) ?? '';
	const includeDeleted =
		includeDeletedRaw === '1' || includeDeletedRaw === 'true';
	const roles = toMulti(sp.Roles);
	const userIDs = toMulti(sp.UserIDs);
	const createdAfter = toSingle(sp.CreatedAfter);
	const createdBefore = toSingle(sp.CreatedBefore);

	await requireRole(isMemberManagerOrHigher);
	const session = await getSession();
	const canCreateUser = isAdminOrHigher(session?.roles ?? []);
	return (
		<div className='space-y-4'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>Members</h1>
				<p className='text-muted-foreground mt-2'>
					Manage and search your members.
				</p>
			</div>
			<UsersSearchView
				pageSize={pageSize}
				pageOffset={pageOffset}
				searchString={searchString}
				includeDeleted={includeDeleted}
				roles={roles}
				userIDs={userIDs}
				createdAfter={createdAfter}
				createdBefore={createdBefore}
				canCreateUser={canCreateUser}
			/>
		</div>
	);
}

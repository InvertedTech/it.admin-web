import { ContentSearchView } from '@/components/admin/content-search-view';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';
import { getSession } from '@/lib/session';

type Props = {
	searchParams?: Promise<{
		pageSize?: string | string[];
		pageOffset?: string | string[];
		minLevel?: string | string[];
		maxLevel?: string | string[];
		channelId?: string | string[];
	}>;
};

function toSingle(v?: string | string[]) {
	return Array.isArray(v) ? v[0] : v;
}

function toInt(v: string | undefined, fallback: number) {
	if (!v) return fallback;
	const n = Number.parseInt(v, 10);
	return Number.isFinite(n) ? n : fallback;
}

export default async function AllContentPage(props: Props) {
	const { searchParams } = await props;
	const sp = (await searchParams) ?? {};
	const pageSize = toInt(toSingle(sp.pageSize), 25);
	const pageOffset = toInt(toSingle(sp.pageOffset), 0);
	const minLevel = toInt(toSingle(sp.minLevel), 0);
	const maxLevel = toInt(toSingle(sp.maxLevel), 9999);
	const channelId = toSingle(sp.channelId) ?? '';
	const roles = (await getSession()).roles;
	// TODO: Figure Out Why This Is Called Here
	await requireRole(isWriterOrHigher);

	return (
		<ContentSearchView
			roles={roles ?? []}
			pageSize={pageSize}
			pageOffset={pageOffset}
			minLevel={minLevel}
			maxLevel={maxLevel}
			channelId={channelId}
		/>
	);
}

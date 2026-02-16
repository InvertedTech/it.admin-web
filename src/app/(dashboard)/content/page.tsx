import { ContentSearchView } from '@/components/admin/content-search-view';
import { getSession } from '@/lib/cookies';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';

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
	await requireRole(isWriterOrHigher);
	const session = await getSession();
	const roles = session?.roles ?? [];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Content</h1>
				<p className="text-muted-foreground mt-2">
					Search and manage your content.
				</p>
			</div>
			<ContentSearchView
				roles={roles}
				pageSize={pageSize}
				pageOffset={pageOffset}
				minLevel={minLevel}
				maxLevel={maxLevel}
				channelId={channelId}
			/>
		</div>
	);
}

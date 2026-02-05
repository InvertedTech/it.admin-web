import { ContentSearchView } from '@/components/admin/content-search-view';
import { getContent } from '@/app/actions/content';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';
import { getSession } from '@/lib/session';

export default async function AllContentPage() {
	const roles = (await getSession()).roles;
	await requireRole(isWriterOrHigher);
	const data = await getContent();
	return <ContentSearchView data={data.Records ?? []} roles={roles ?? []} />;
}

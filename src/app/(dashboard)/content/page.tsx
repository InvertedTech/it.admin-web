import { ContentSearchView } from '@/components/admin/content-search-view';
import { getContent } from '@/app/actions/content';

export default async function AllContentPage() {
	const data = await getContent();
	return <ContentSearchView data={data.Records ?? []} />;
}

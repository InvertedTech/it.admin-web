import { adminGetContent } from '@/app/actions/content';
import { ContentData } from '@/components/content/content-data';
import { ContentDetails } from '@/components/content/content-details';
import { ContentEmpty } from '@/components/content/content-empty';
import { ContentTimeline } from '@/components/content/content-timeline';
import { ViewContentHeader } from '@/components/content/view-content-header';

// Simple asset URL helper
function getAssetUrl(assetId?: string): string | undefined {
	if (!assetId) return undefined;
	const base =
		process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
	return `${base}/cms/asset/${assetId}/data`;
}

export default async function ViewContentPage({
	params,
}: {
	params: { contentId: string };
}) {
	const { contentId } = await params;
	const res = await adminGetContent(contentId);
	const record = (res as any)?.Record;
	if (!record) {
		return <ContentEmpty />;
	}

	const publicMeta = (record?.Public ?? {}) as any;
	const pubData = (publicMeta?.Data ?? publicMeta ?? {}) as any;
	const privateMeta = (record?.Private ?? {}) as any;
	const privData = (privateMeta?.Data ?? {}) as any;

	const id =
		pubData?.ContentID ??
		publicMeta?.ContentID ??
		(record as any)?.ContentID ??
		contentId;

	const subscriptionLevel: number = Number(pubData?.SubscriptionLevel ?? 0);
	const featuredAssetId: string | undefined =
		pubData?.FeaturedImageAssetID ?? undefined;
	const createdOn = publicMeta?.CreatedOnUTC;
	const publishOn = publicMeta?.PublishOnUTC;
	const pinnedOn = publicMeta?.PinnedOnUTC;
	const announceOn = publicMeta?.AnnounceOnUTC;

	const featuredUrl = getAssetUrl(featuredAssetId);

	const coarseTypeLabel = 'Content';

	return (
		<div className="container mx-auto space-y-6 py-8">
			<ViewContentHeader
				id={id}
				title={pubData?.Title}
				description={pubData?.Description}
				featuredUrl={featuredUrl}
				coarseTypeLabel={coarseTypeLabel}
				subscriptionLevel={subscriptionLevel}
				publishOn={publishOn}
			/>
			<ContentDetails
				id={id}
				pubData={pubData}
			/>

			<ContentTimeline
				contentId={id}
				createdOn={createdOn}
				pinnedOn={pinnedOn}
				publishOn={publishOn}
				announceOn={announceOn}
			/>

			<ContentData
				pubData={pubData}
				privData={privData}
			/>
		</div>
	);
}

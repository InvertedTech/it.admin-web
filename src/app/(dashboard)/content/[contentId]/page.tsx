import { adminGetContent } from '@/app/actions/content';
import { ContentData } from '@/components/content/content-data';
import { ContentDetails } from '@/components/content/content-details';
import { ContentEmpty } from '@/components/content/content-empty';
import { ContentTimeline } from '@/components/content/content-timeline';
import { ViewContentHeader } from '@/components/content/view-content-header';
import { requireRole } from '@/lib/rbac';
import { isPublisherOrHigher, isWriterOrHigher } from '@/lib/roleHelpers';
import { getSession } from '@/lib/session';
import { getApiBase } from '@/lib/apiBase';

// Simple asset URL helper
function getAssetUrl(assetId?: string): string | undefined {
	if (!assetId) return undefined;
	const base = getApiBase();
	if (!base) return undefined;
	return `${base}/cms/asset/${assetId}/data`;
}

export default async function ViewContentPage({
	params,
}: {
	params: { contentId: string };
}) {
	await requireRole(isWriterOrHigher);
	const { contentId } = await params;
	const session = await getSession();
	const canPublish = isPublisherOrHigher(session.roles ?? []);
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
		<div>
			<div className='mb-6'>
				<ViewContentHeader
					id={id}
					title={pubData?.Title}
					description={pubData?.Description}
					featuredUrl={featuredUrl}
					coarseTypeLabel={coarseTypeLabel}
					subscriptionLevel={subscriptionLevel}
					publishOn={publishOn}
				/>
			</div>
			<div className='mb-4'>
				<ContentDetails id={id} pubData={pubData} />
			</div>
			<div className='mb-4'>
				<ContentTimeline
					contentId={id}
					createdOn={createdOn}
					pinnedOn={pinnedOn}
					publishOn={publishOn}
					announceOn={announceOn}
					canPublish={canPublish}
				/>
			</div>
			<div className='mb-4'>
				<ContentData pubData={pubData} privData={privData} />
			</div>
		</div>
	);
}

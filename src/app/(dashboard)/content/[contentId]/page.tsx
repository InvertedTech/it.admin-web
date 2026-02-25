import { adminGetContent } from '@/app/actions/content';
import { ContentData } from '@/components/content/content-data';
import { ContentDetails } from '@/components/content/content-details';
import { ContentEmpty } from '@/components/content/content-empty';
import { ContentTimeline } from '@/components/content/content-timeline';
import { ViewContentHeader } from '@/components/content/view-content-header';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/lib/cookies';
import { requireRole } from '@/lib/rbac';
import { isPublisherOrHigher, isWriterOrHigher } from '@/lib/roleHelpers';
import { getApiBase } from '@/lib/apiBase';
import { getCommentsForContent } from '@/app/actions/comments';
import { create } from '@bufbuild/protobuf';
import { GetCommentsForContentRequestSchema } from '@inverted-tech/fragments/Comment';
import { CommentsTable } from '@/components/tables/comments-table';

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
	const session = await getSession();
	const roles = session?.roles ?? [];
	const { contentId } = await params;
	const canPublish = isPublisherOrHigher(roles);
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

	const comments = await getCommentsForContent(
		create(GetCommentsForContentRequestSchema, {
			PageSize: 25,
			PageOffset: 0,
			ContentID: contentId,
		}),
	);

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
			<div className='mb-4'>
				<Card>
					<CardHeader>
						<CardTitle>Comments</CardTitle>
						<CardDescription>
							Review and manage comments for this content.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CommentsTable
							pageSize={25}
							response={comments}
							contentId={contentId}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

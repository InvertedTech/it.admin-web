'use server';
import { adminSearchContent } from '@/app/actions/content';
import { create } from '@bufbuild/protobuf';
import { GetAllContentAdminRequestSchema } from '@inverted-tech/fragments/Content';
import { RecentContentCard } from './recent-content-card';

export async function RecentContentServer() {
	const recentContent = await adminSearchContent(
		create(GetAllContentAdminRequestSchema, {
			PageSize: 5,
			PageOffset: 0,
			SubscriptionSearch: {
				MinimumLevel: 0,
				MaximumLevel: 9999,
			},
		}),
	);

	return <RecentContentCard items={recentContent.Records ?? []} />;
}

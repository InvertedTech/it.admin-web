import { ContentWeekView } from '@/components/content/content-week-view';
import { RecentContentCard } from '@/components/dashboard/recent-content-card';
import { SectionCards } from '@/components/section-cards';
import { adminSearchContent, getWeekEvents } from '@/app/actions/content';
import { create } from '@bufbuild/protobuf';
import { GetAllContentAdminRequestSchema } from '@inverted-tech/fragments/Content';
import { requireAnyRole } from '@/lib/rbac';

export default async function Page() {
	// TODO(auth-removal): Remove role/authorization gate.
	await requireAnyRole();
	const weekEvents = await getWeekEvents();
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
	// TODO: Put actual data in Section Cards
	return (
		<div>
			<div className="space-y-6">
				<SectionCards />
				<ContentWeekView events={weekEvents} />
				<RecentContentCard items={recentContent.Records ?? []} />
			</div>
		</div>
	);
}

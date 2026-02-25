'use server';
import { requireAnyRole } from '@/lib/rbac';
import DashboardServer from '@/components/dashboard/dashboard-server';
import { RecentContentServer } from '@/components/dashboard/recent-content-server';
import { ContentWeekViewServer } from '@/components/dashboard/content-week-view-server';

export default async function Page() {
	await requireAnyRole();

	return (
		<div>
			<div className='space-y-6'>
				<DashboardServer />
				<ContentWeekViewServer />
				<RecentContentServer />
			</div>
		</div>
	);
}

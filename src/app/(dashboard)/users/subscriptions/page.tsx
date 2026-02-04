import { listSubscriptions } from '@/app/actions/payment';
import { SubscriptionListTable } from '@/components/users/subscriptions/subscription-list-table';

export default async function SubscriptionListPage() {
	const subs = await listSubscriptions(10, 0);
	return (
		<div>
			<SubscriptionListTable subscriptions={subs.Subscriptions} />
		</div>
	);
}

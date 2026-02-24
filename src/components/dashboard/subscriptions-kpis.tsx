import { SubscriptionKpis } from '@inverted-tech/fragments/Dashboard';
import { CentsComparisonCard, CountComparisonCard } from './metric-card';

export function SubscriptionsKpis({ kpis }: { kpis: SubscriptionKpis }) {
	return (
		<>
			<CountComparisonCard
				title='Active Subscriptions'
				metric={kpis?.ActiveSubscriptions}
				previousLabel='Previous Active Subscriptions'
				className='h-name'
			/>
			<CountComparisonCard
				title='New Subscriptions'
				metric={kpis?.NewSubscriptions}
				previousLabel='Previous New Subscriptions'
				className='h-name'
			/>
			<CountComparisonCard
				title='Canceled Subscriptions'
				metric={kpis?.CanceledSubscriptions}
				previousLabel='Previous Canceled Subscriptions'
				className='h-name'
			/>
			<CentsComparisonCard
				title='New Subscription Revenue'
				metric={kpis?.NewSubscriptionRevenue}
				previousLabel='Previous New Subscription Revenue'
				className='h-name'
			/>
			<CentsComparisonCard
				title='Total Revenue'
				metric={kpis?.TotalSubscriptionRevenue}
				previousLabel='Previous Total Revenue'
				className='h-name'
			/>
		</>
	);
}

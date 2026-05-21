import { SubscriptionKpis } from '@inverted-tech/fragments/Dashboard';
import {
	CentsComparisonCard,
	CentsSeriesLineCard,
	CountComparisonCard,
	NewAndCanceledSeriesBarCard,
} from './metric-card';

export function SubscriptionsKpis({ kpis }: { kpis: SubscriptionKpis }) {
	return (
		<div className='space-y-6 w-full max-w-(--breakpoint-2xl) mx-auto'>
			{/* Top Row: Metric Cards Grid */}
			<div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-5 auto-rows-fr items-stretch *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs'>
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
			</div>

			{/* Fixed Charts Section: Single-Column Grid prevents layout overlap */}
			<div className='grid grid-cols-1 gap-6'>
				<NewAndCanceledSeriesBarCard
					//@ts-ignore
					newSeries={kpis.NewSubscriptionsSeries}
					//@ts-ignore
					canceledSeries={kpis.CanceledSubscriptionsSeries}
					className='w-full h-[320px]'
				/>
				<CentsSeriesLineCard
					title='Total Revenue'
					//@ts-ignore
					series={kpis.TotalRevenueSeries}
					currency='USD'
					className='w-full h-[320px]'
				/>
			</div>
		</div>
	);
}

import { MetricCard, MetricCardProps } from './dashboard/metric-card';

const metrics: MetricCardProps[] = [
	{
		title: 'Total Revenue',
		value: '$1,250.00',
		trend: 'up',
		percent: '+12.5%',
		subtitle: 'Trending up this month',
		description: 'Visitors for the last 6 months',
	},
	{
		title: 'New Customers',
		value: '1,234',
		trend: 'down',
		percent: '-20%',
		subtitle: 'Down 20% this period',
		description: 'Acquisition needs attention',
	},
	{
		title: 'Active Accounts',
		value: '45,678',
		trend: 'up',
		percent: '+12.5%',
		subtitle: 'Strong user retention',
		description: 'Engagement exceed targets',
	},
	{
		title: 'Growth Rate',
		value: '4.5%',
		trend: 'up',
		percent: '+4.5%',
		subtitle: 'Steady performance increase',
		description: 'Meets growth projections',
	},
];

export function SectionCards() {
	return (
		<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
			{metrics.map((m) => (
				<MetricCard
					key={m.title}
					{...m}
				/>
			))}
		</div>
	);
}

import { ContentKpis } from '@inverted-tech/fragments/Dashboard';
import { CountComparisonCard, RatioComparisonCard } from './metric-card';

export function ContentKpisCards({ kpis }: { kpis: ContentKpis }) {
	return (
		<>
			<CountComparisonCard
				title='Unique Viewers'
				metric={kpis?.UniqueViewers}
				previousLabel='Previous Unique Viewers'
				className='h-full'
			/>
			<RatioComparisonCard
				title='Completion Rate'
				metric={kpis?.CompletionRate}
				previousLabel='Previous Completion Rate'
				ratioScale='percent'
				className='h-full'
			/>
			<RatioComparisonCard
				title='Median Completion %'
				metric={kpis?.MedianCompletionPercent}
				previousLabel='Previous Median Completion %'
				ratioScale='percent'
				className='h-full'
			/>
			<RatioComparisonCard
				title='Avg Consumption Seconds'
				metric={kpis?.AvgConsumptionSeconds}
				previousLabel='Previous Avg Consumption Seconds'
				ratioScale='ratio'
				ratioDecimals={1}
				className='h-full'
			/>
		</>
	);
}

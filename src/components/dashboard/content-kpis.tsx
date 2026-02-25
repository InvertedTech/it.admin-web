import { ContentKpis } from '@inverted-tech/fragments/Dashboard';
import { CountComparisonCard, RatioComparisonCard } from './metric-card';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

function asNumber(value: bigint | number | string | undefined): number {
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return value ?? 0;
}

export function ContentKpisCards({ kpis }: { kpis: ContentKpis }) {
	const topLikedContent = kpis?.TopLikedContent ?? [];

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
			<Card className='@container/card h-full @xl/main:col-span-2 @5xl/main:col-span-4'>
				<CardHeader>
					<CardDescription>Top Liked Content</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
						{topLikedContent.length.toLocaleString()} items
					</CardTitle>
				</CardHeader>
				<CardContent className='pt-0'>
					<Table className='text-sm'>
						<TableHeader className='bg-muted/30'>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead className='text-right'>Like Count</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{topLikedContent.length > 0 ? (
								topLikedContent.map((item) => (
									<TableRow key={item.ContentId}>
										<TableCell>{item.ContentTitle}</TableCell>
										<TableCell className='text-right'>
											{asNumber(item.LikeCount).toLocaleString()}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={2}
										className='text-muted-foreground text-center'
									>
										No liked content data available.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</>
	);
}

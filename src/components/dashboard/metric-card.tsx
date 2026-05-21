'use client';

import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import type {
	CentsComparison,
	CountComparison,
	RatioComparison,
	CountSeriesPoint,
	CentsSeriesPoint,
} from '@inverted-tech/fragments/Dashboard';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from 'recharts';

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart';

type Trend = 'up' | 'down';

export type MetricCardProps = {
	title: string;
	value: string;
	trend: Trend;
	percent: string;
	subtitle: string;
	description: string;
	className?: string;
};

type ComparisonCardBaseProps = {
	title: string;
	className?: string;
	valueSuffix?: string;
	previousLabel?: string;
};

export type CountComparisonCardProps = ComparisonCardBaseProps & {
	metric?: CountComparison;
};

export type CentsComparisonCardProps = ComparisonCardBaseProps & {
	metric?: CentsComparison;
	currency?: string;
};

export type RatioComparisonCardProps = ComparisonCardBaseProps & {
	metric?: RatioComparison;
	ratioScale?: 'ratio' | 'percent';
	ratioDecimals?: number;
};

function asNumber(value: bigint | number | string | undefined): number {
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return value ?? 0;
}

function getTrend(percentageChange: number): Trend {
	return percentageChange >= 0 ? 'up' : 'down';
}

function formatDeltaPercent(value: number): string {
	return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function MetricCard({
	title,
	value,
	trend,
	percent,
	subtitle,
	description,
	className,
}: MetricCardProps) {
	const TrendIcon = trend === 'up' ? IconTrendingUp : IconTrendingDown;
	const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

	return (
		<Card className={`@container/card ${className ?? ''}`}>
			<CardHeader>
				<CardDescription>{title}</CardDescription>
				<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
					{value}
				</CardTitle>
				<CardAction>
					<Badge variant='outline' className={trendColor}>
						<TrendIcon className='size-4' />
						{percent}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className='flex-col items-start gap-1.5 text-sm'>
				<div className='line-clamp-1 flex gap-2 font-medium'>
					{subtitle} <TrendIcon className='size-4' />
				</div>
				<div className='text-muted-foreground'>{description}</div>
			</CardFooter>
		</Card>
	);
}

export function CountComparisonCard({
	metric,
	title,
	className,
	valueSuffix = '',
	previousLabel = 'Previous period',
}: CountComparisonCardProps) {
	const currentValue = asNumber(metric?.CurrentCount);
	const previousValue = asNumber(metric?.PreviousCount);
	const percentageChange = metric?.PercentageChange ?? 0;
	const trend = getTrend(percentageChange);

	return (
		<MetricCard
			title={title}
			value={`${currentValue.toLocaleString()}${valueSuffix}`}
			trend={trend}
			percent={formatDeltaPercent(percentageChange)}
			subtitle={`${trend === 'up' ? 'Increased' : 'Decreased'} vs previous period`}
			description={`${previousLabel}: ${previousValue.toLocaleString()}${valueSuffix}`}
			className={className}
		/>
	);
}

export function CentsComparisonCard({
	metric,
	title,
	className,
	currency = 'USD',
	previousLabel = 'Previous period',
}: CentsComparisonCardProps) {
	const currentCents = asNumber(metric?.CurrentCents);
	const previousCents = asNumber(metric?.PreviousCents);
	const percentageChange = metric?.PercentageChange ?? 0;
	const trend = getTrend(percentageChange);
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	});

	return (
		<MetricCard
			title={title}
			value={formatter.format(currentCents / 100)}
			trend={trend}
			percent={formatDeltaPercent(percentageChange)}
			subtitle={`${trend === 'up' ? 'Increased' : 'Decreased'} vs previous period`}
			description={`${previousLabel}: ${formatter.format(previousCents / 100)}`}
			className={className}
		/>
	);
}

export function RatioComparisonCard({
	metric,
	title,
	className,
	previousLabel = 'Previous period',
	ratioScale = 'ratio',
	ratioDecimals = 2,
}: RatioComparisonCardProps) {
	const currentRatio = metric?.CurrentRatio ?? 0;
	const previousRatio = metric?.PreviousRatio ?? 0;
	const percentageChange = metric?.PercentageChange ?? 0;
	const trend = getTrend(percentageChange);

	const toDisplay = (value: number) => {
		if (ratioScale === 'percent')
			return `${(value * 100).toFixed(ratioDecimals)}%`;
		return value.toFixed(ratioDecimals);
	};

	return (
		<MetricCard
			title={title}
			value={toDisplay(currentRatio)}
			trend={trend}
			percent={formatDeltaPercent(percentageChange)}
			subtitle={`${trend === 'up' ? 'Increased' : 'Decreased'} vs previous period`}
			description={`${previousLabel}: ${toDisplay(previousRatio)}`}
			className={className}
		/>
	);
}

export type CountSeriesBarCardProps = {
	title: string;
	series?: CountSeriesPoint[];
	className?: string;
};

export type CentsSeriesBarCardProps = {
	title: string;
	series?: CentsSeriesPoint[];
	currency?: string;
	className?: string;
};

export function CountSeriesBarCard({
	title,
	series = [],
	className,
}: CountSeriesBarCardProps) {
	const chartData = series.map((point, index) => {
		const monthsAgo = series.length - 1 - index;
		const date = new Date();
		date.setMonth(date.getMonth() - monthsAgo);
		date.setDate(1);

		const monthShort = date.toLocaleString('en-US', { month: 'short' });
		const yearShort = date.getFullYear().toString().slice(-2);
		const label = `${monthShort} '${yearShort}`;

		return {
			month: label,
			subscriptions: asNumber(point.Value),
		};
	});

	const chartConfig = {
		subscriptions: {
			label: 'Subscriptions',
			color: 'var(--chart-1)',
		},
	} satisfies ChartConfig;

	return (
		<Card className={`relative overflow-hidden ${className ?? ''}`}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>Last 13 months</CardDescription>
			</CardHeader>
			<CardContent className='pb-4'>
				<ChartContainer
					config={chartConfig}
					className='h-[230px] w-full'
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{ top: 10, right: 12, left: 0, bottom: 15 }}
					>
						<CartesianGrid vertical={false} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							allowDecimals={false}
							tickFormatter={(value) => value.toLocaleString()}
						/>
						<XAxis
							dataKey='month'
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value) => [
										Number(value).toLocaleString(),
										'Subscriptions',
									]}
								/>
							}
						/>
						<Bar
							dataKey='subscriptions'
							fill='var(--color-subscriptions)'
							radius={8}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 leading-none font-medium'>
					Month-over-month new subscriptions
				</div>
				<div className='leading-none text-muted-foreground'>
					Showing full monthly counts (including zeros)
				</div>
			</CardFooter>
		</Card>
	);
}

export function CentsSeriesBarCard({
	title,
	series = [],
	currency = 'USD',
	className,
}: CentsSeriesBarCardProps) {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	});

	const chartData = series.map((point, index) => {
		const monthsAgo = series.length - 1 - index;
		const date = new Date();
		date.setMonth(date.getMonth() - monthsAgo);
		date.setDate(1);

		const monthShort = date.toLocaleString('en-US', { month: 'short' });
		const yearShort = date.getFullYear().toString().slice(-2);
		const label = `${monthShort} '${yearShort}`;

		return {
			month: label,
			revenue: asNumber(point.ValueCents) / 100,
		};
	});

	const chartConfig = {
		revenue: {
			label: 'Revenue',
			color: 'var(--chart-2)',
		},
	} satisfies ChartConfig;

	return (
		<Card className={`relative overflow-hidden ${className ?? ''}`}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>Last 13 months</CardDescription>
			</CardHeader>
			<CardContent className='pb-4'>
				<ChartContainer
					config={chartConfig}
					className='h-[230px] w-full'
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{ top: 10, right: 12, left: 0, bottom: 15 }}
					>
						<CartesianGrid vertical={false} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => {
								if (value >= 1000)
									return `$${(value / 1000).toFixed(1)}k`;
								return `$${value}`;
							}}
						/>
						<XAxis
							dataKey='month'
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value) => [
										formatter.format(Number(value)),
										'Revenue',
									]}
								/>
							}
						/>
						<Bar
							dataKey='revenue'
							fill='var(--color-revenue)'
							radius={8}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 leading-none font-medium'>
					Month-over-month total revenue
				</div>
				<div className='leading-none text-muted-foreground'>
					Showing full monthly revenue (including zeros)
				</div>
			</CardFooter>
		</Card>
	);
}

export type NewAndCanceledSeriesBarCardProps = {
	title?: string;
	newSeries?: CountSeriesPoint[];
	canceledSeries?: CountSeriesPoint[];
	className?: string;
};

export function NewAndCanceledSeriesBarCard({
	title = 'New vs Canceled Subscriptions',
	newSeries = [],
	canceledSeries = [],
	className,
}: NewAndCanceledSeriesBarCardProps) {
	const chartData = newSeries.map((point, index) => {
		const monthsAgo = newSeries.length - 1 - index;
		const date = new Date();
		date.setMonth(date.getMonth() - monthsAgo);
		date.setDate(1);

		const monthShort = date.toLocaleString('en-US', { month: 'short' });
		const yearShort = date.getFullYear().toString().slice(-2);
		const label = `${monthShort} '${yearShort}`;

		return {
			month: label,
			new: asNumber(point.Value),
			canceled: asNumber(canceledSeries[index]?.Value ?? 0),
		};
	});

	const chartConfig = {
		new: {
			label: 'New Subscriptions',
			color: 'var(--chart-1)',
		},
		canceled: {
			label: 'Canceled Subscriptions',
			color: 'var(--chart-2)',
		},
	} satisfies ChartConfig;

	return (
		<Card className={`relative overflow-hidden ${className ?? ''}`}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>Last 13 months</CardDescription>
			</CardHeader>
			<CardContent className='pb-4'>
				<ChartContainer
					config={chartConfig}
					className='h-[230px] w-full'
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{ top: 10, right: 12, left: 0, bottom: 20 }}
					>
						<CartesianGrid vertical={false} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							allowDecimals={false}
							tickFormatter={(value) => {
								if (value >= 1000)
									return `${(value / 1000).toFixed(1)}k`;
								return value.toLocaleString();
							}}
						/>
						<XAxis
							dataKey='month'
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value, name) => {
										const label =
											name === 'new' ? 'New' : 'Canceled';
										return [
											Number(value).toLocaleString(),
											label,
										];
									}}
								/>
							}
						/>
						<Bar
							dataKey='new'
							fill='var(--color-chart-3)'
							radius={8}
						/>
						<Bar
							dataKey='canceled'
							fill='var(--color-destructive)'
							radius={8}
						/>
						<ChartLegend content={<ChartLegendContent />} />
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 leading-none font-medium'>
					New vs Canceled subscriptions
				</div>
				<div className='leading-none text-muted-foreground'>
					Showing full monthly counts (including zeros)
				</div>
			</CardFooter>
		</Card>
	);
}

export type CentsSeriesLineCardProps = {
	title: string;
	series?: CentsSeriesPoint[];
	currency?: string;
	className?: string;
};

export function CentsSeriesLineCard({
	title,
	series = [],
	currency = 'USD',
	className,
}: CentsSeriesLineCardProps) {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	});

	const chartData = series.map((point, index) => {
		const monthsAgo = series.length - 1 - index;
		const date = new Date();
		date.setMonth(date.getMonth() - monthsAgo);
		date.setDate(1);

		const monthShort = date.toLocaleString('en-US', { month: 'short' });
		const yearShort = date.getFullYear().toString().slice(-2);
		const label = `${monthShort} '${yearShort}`;

		return {
			month: label,
			revenue: asNumber(point.ValueCents) / 100,
		};
	});

	const chartConfig = {
		revenue: {
			label: 'Revenue',
			color: 'var(--chart-2)',
		},
	} satisfies ChartConfig;

	return (
		<Card className={`relative overflow-hidden ${className ?? ''}`}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>Last 13 months</CardDescription>
			</CardHeader>
			<CardContent className='pb-4'>
				<ChartContainer
					config={chartConfig}
					className='h-[230px] w-full'
				>
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{ top: 10, right: 12, left: 0, bottom: 15 }}
					>
						<CartesianGrid vertical={false} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => {
								if (value >= 1000)
									return `$${(value / 1000).toFixed(1)}k`;
								return `$${value}`;
							}}
						/>
						<XAxis
							dataKey='month'
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value) => [
										formatter.format(Number(value)),
										'Revenue',
									]}
								/>
							}
						/>
						<Line
							dataKey='revenue'
							type='monotone'
							stroke='var(--color-revenue)'
							strokeWidth={2}
							dot={{
								r: 4,
								fill: 'var(--color-revenue)',
								strokeWidth: 0,
							}}
							activeDot={{
								r: 6,
							}}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 leading-none font-medium'>
					Month-over-month total revenue
				</div>
				<div className='leading-none text-muted-foreground'>
					Showing full monthly revenue (including zeros)
				</div>
			</CardFooter>
		</Card>
	);
}

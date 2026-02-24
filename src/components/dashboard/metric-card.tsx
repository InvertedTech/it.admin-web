import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import type {
	CentsComparison,
	CountComparison,
	RatioComparison,
} from '@inverted-tech/fragments/Dashboard';
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

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
				<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
					{value}
				</CardTitle>
				<CardAction>
					<Badge
						variant="outline"
						className={trendColor}
					>
						<TrendIcon className="size-4" />
						{percent}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					{subtitle} <TrendIcon className="size-4" />
				</div>
				<div className="text-muted-foreground">{description}</div>
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
		if (ratioScale === 'percent') return `${(value * 100).toFixed(ratioDecimals)}%`;
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

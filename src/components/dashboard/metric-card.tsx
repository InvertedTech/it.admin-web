import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
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

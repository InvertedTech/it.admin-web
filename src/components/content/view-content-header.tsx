// components/content/content-header.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MaybeTimestamp = unknown;

function toJsDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	if (typeof value === 'object' && value && 'seconds' in (value as any)) {
		const s = Number((value as any).seconds ?? 0);
		const n = Number((value as any).nanos ?? 0);
		const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	return undefined;
}
function fmtDate(input?: MaybeTimestamp) {
	const d = input ? toJsDate(input) : undefined;
	return d ? d.toLocaleString() : '—';
}
function levelLabel(level: number) {
	if (level <= 0) return 'Free';
	if (level === 1) return 'Subscriber';
	if (level === 2) return 'Paid';
	return `Level ${level}`;
}

export type ViewContentHeaderProps = {
	id: string;
	title?: string;
	description?: string;
	featuredUrl?: string;
	coarseTypeLabel?: string;
	subscriptionLevel?: number;
	publishOn?: MaybeTimestamp;
	className?: string;
};

export function ViewContentHeader({
	id,
	title = 'Untitled',
	description = 'No description provided.',
	featuredUrl,
	coarseTypeLabel = 'Content',
	subscriptionLevel = 0,
	publishOn,
	className,
}: ViewContentHeaderProps) {
	return (
		<div
			className={`flex items-start justify-between gap-4 ${className ?? ''}`}
		>
			<div className="flex items-start gap-4">
				{featuredUrl ? (
					<img
						src={featuredUrl}
						alt="Featured"
						className="hidden h-20 w-20 shrink-0 rounded-md border object-cover sm:block"
					/>
				) : null}
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
					<div className="flex flex-wrap items-center gap-2 pt-1">
						<Badge variant="secondary">{coarseTypeLabel}</Badge>
						<Badge>{levelLabel(subscriptionLevel)}</Badge>
						{publishOn ? (
							<Badge variant="outline">Published {fmtDate(publishOn)}</Badge>
						) : (
							<Badge variant="outline">Unpublished</Badge>
						)}
					</div>
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Button
					asChild
					variant="outline"
				>
					<a href={`/content/${id}`}>Refresh</a>
				</Button>
				<Button asChild>
					<a href={`/content/${id}/edit`}>Edit</a>
				</Button>
			</div>
		</div>
	);
}

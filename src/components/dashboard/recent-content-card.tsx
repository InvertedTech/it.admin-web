'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentListRecord } from '@inverted-tech/fragments/Content';

const ContentTypeLabels: Record<ContentListRecord['ContentType'], string> = {
	0: 'Article',
	1: 'Video',
	2: 'Podcast',
	3: 'Livestream',
	4: 'Gallery',
};

type MaybeTimestamp = unknown;

function toJsDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		'toDate' in (value as any) &&
		typeof (value as any).toDate === 'function'
	) {
		try {
			const d = (value as any).toDate();
			if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
		} catch {}
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		'seconds' in (value as any)
	) {
		const seconds = (value as any).seconds as unknown;
		const nanos = (value as any).nanos as unknown;
		const sNum =
			typeof seconds === 'string'
				? Number(seconds)
				: typeof seconds === 'number'
					? seconds
					: typeof seconds === 'bigint'
						? Number(seconds)
						: undefined;
		const nNum =
			typeof nanos === 'string'
				? Number(nanos)
				: typeof nanos === 'number'
					? nanos
					: typeof nanos === 'bigint'
						? Number(nanos)
						: 0;
		if (typeof sNum === 'number' && Number.isFinite(sNum)) {
			const millis = sNum * 1000 + Math.floor(nNum / 1_000_000);
			const d = new Date(millis);
			return Number.isNaN(d.getTime()) ? undefined : d;
		}
	}
	return undefined;
}

function fmtDate(input?: MaybeTimestamp) {
	const d = input ? toJsDate(input) : undefined;
	if (!d) return '-';
	return d.toLocaleString();
}

export function RecentContentCard({ items }: { items: ContentListRecord[] }) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between gap-4'>
				<div>
					<CardTitle>Recent Content</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Latest posts and updates.
					</p>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{items.map((item) => {
						const date =
							(item as any)?.PublishOnUTC ??
							(item as any)?.PublishOnUtc ??
							(item as any)?.CreatedOnUTC ??
							(item as any)?.CreatedOnUtc;
						return (
							<div
								key={item.ContentID || item.Title}
								className='flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0'
							>
								<div className='min-w-0'>
									<div className='flex items-center gap-2'>
										<span className='truncate font-medium'>
											{item.Title || 'Untitled'}
										</span>
										<Badge variant='secondary'>
											{ContentTypeLabels[
												item.ContentType
											] ?? 'Content'}
										</Badge>
									</div>
									<div className='text-xs text-muted-foreground'>
										{item.Author || 'Unknown author'}
									</div>
								</div>
								<div className='text-xs text-muted-foreground whitespace-nowrap'>
									{fmtDate(date)}
								</div>
							</div>
						);
					})}
					{items.length === 0 && (
						<div className='text-sm text-muted-foreground'>
							No recent content found.
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tier } from '@/components/forms/fields/TierListField';

function centsToCurrency(cents: number) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
		}).format(cents / 100);
	} catch {
		return `$${(cents / 100).toFixed(2)}`;
	}
}

export function TierDisplayGrid({ tiers }: { tiers: Tier[] }) {
	return (
		<div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
			{tiers.map((t, i) => (
				<Card key={`${t.Name}-${i}`} className='overflow-hidden'>
					<div
						className='h-1 w-full'
						style={{ backgroundColor: t.Color || '#e5e7eb' }}
					/>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<CardTitle>{t.Name || 'Untitled'}</CardTitle>
							<Badge
								variant='secondary'
								style={{ backgroundColor: `${t.Color}22` }}
							>
								{centsToCurrency(t.AmountCents || 0)}/mo
							</Badge>
						</div>
						<CardDescription>
							{t.Description || '—'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-xs text-muted-foreground'>
							Color:{' '}
							<span className='font-mono'>
								{t.Color || 'N/A'}
							</span>
						</div>
					</CardContent>
				</Card>
			))}
			{tiers.length === 0 && (
				<div className='text-sm text-muted-foreground'>
					No tiers to display.
				</div>
			)}
		</div>
	);
}

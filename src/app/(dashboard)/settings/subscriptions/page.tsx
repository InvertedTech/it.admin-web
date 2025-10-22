'use client';
import { TierConfig, TiersForm } from '@/components/forms/tiers-form';
import { TierDisplayGrid } from '@/components/subscriptions/tier-display';

const initial: TierConfig = {
	Tiers: [
		{
			Name: 'Free',
			Description: 'Read public posts and watch free videos.',
			Color: '#94a3b8',
			AmountCents: 0,
		},
		{
			Name: 'Member',
			Description: 'Access member-only posts, comment, and join Q&A.',
			Color: '#10b981',
			AmountCents: 500, // $5.00
		},
		{
			Name: 'Pro',
			Description:
				'Everything in Member + behind-the-scenes and bonus content.',
			Color: '#7c3aed',
			AmountCents: 1500, // $15.00
		},
	],
};

export default function SubscriptionTiersPage() {
	// In a real app, you’d fetch/load tiers and pass them in.
	// The form’s onSave can call your API and revalidate the page.

	return (
		<div className='container mx-auto space-y-8 py-8'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Subscription Tiers
				</h1>
				<p className='text-muted-foreground'>
					Define, reorder, and preview your membership tiers.
				</p>
			</div>

			<TiersForm
				initial={initial}
				onSave={async (val) => {
					// TODO: wire to your backend.
					// await fetch("/api/subscriptions/tiers", { method: "POST", body: JSON.stringify(val) })
					console.log('save tiers', val);
				}}
			/>

			<div className='space-y-4'>
				<h2 className='text-lg font-medium'>Preview</h2>
				<TierDisplayGrid tiers={initial.Tiers} />
			</div>
		</div>
	);
}

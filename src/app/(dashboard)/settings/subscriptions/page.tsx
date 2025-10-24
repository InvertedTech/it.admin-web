'use server';
import { getAdminSettings, modifyPublicSubscriptionSettings } from '@/app/actions/settings';
import { TierConfig, TiersForm } from '@/components/forms/tiers-form';
import { SubscriptionConstraintsForm } from '@/components/forms/subscriptions-constraints-form';
import { ManualProviderForm } from '@/components/forms/subscriptions-provider-manual-form';
import { FortisProviderForm } from '@/components/forms/subscriptions-provider-fortis-form';
import { CryptoProviderForm } from '@/components/forms/subscriptions-provider-crypto-form';
import { StripeProviderForm } from '@/components/forms/subscriptions-provider-stripe-form';
import { PaypalProviderForm } from '@/components/forms/subscriptions-provider-paypal-form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

export default async function SubscriptionSettingsPage() {
    const { Public } = await getAdminSettings();
    const sub = Public?.Subscription;

	const tiersInitial: TierConfig = {
		Tiers: sub?.Tiers && sub.Tiers.length ? sub.Tiers : [],
	};

	return (
		<div className="container mx-auto space-y-8 py-8">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
				<p className="text-muted-foreground">Configure membership tiers, constraints, and providers.</p>
			</div>

			{/* Tiers */}
            <TiersForm initial={tiersInitial} onSave={saveTiers} />



			{/* Constraints */}
			<SubscriptionConstraintsForm base={sub as any} initial={sub as any} />

			{/* Providers (collapsible sections) */}
			<div className="space-y-4">
				<Collapsible defaultOpen={!!sub?.Manual?.Enabled}>
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full justify-between">Manual</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ManualProviderForm base={sub as any} />
					</CollapsibleContent>
				</Collapsible>

				<Collapsible defaultOpen={!!sub?.Fortis?.Enabled}>
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full justify-between">Fortis</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<FortisProviderForm base={sub as any} />
					</CollapsibleContent>
				</Collapsible>

				<Collapsible defaultOpen={!!sub?.Crypto?.Enabled}>
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full justify-between">Crypto</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<CryptoProviderForm base={sub as any} />
					</CollapsibleContent>
				</Collapsible>

				<Collapsible defaultOpen={!!sub?.Stripe?.Enabled}>
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full justify-between">Stripe</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<StripeProviderForm base={sub as any} />
					</CollapsibleContent>
				</Collapsible>

				<Collapsible defaultOpen={!!sub?.Paypal?.Enabled}>
					<CollapsibleTrigger asChild>
						<Button variant="outline" className="w-full justify-between">PayPal</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<PaypalProviderForm base={sub as any} />
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}

async function saveTiers(val: TierConfig) {
    'use server';
    const { Public } = await getAdminSettings();
    const sub = Public?.Subscription ?? {};
    const merged = { ...sub, Tiers: val.Tiers } as any;
    await modifyPublicSubscriptionSettings({ Data: merged } as any);
}

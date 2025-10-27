// page.tsx
'use server';
import {
	getAdminSettings,
	modifyPublicSubscriptionSettings,
} from '@/app/actions/settings';
import { TierConfig, TiersForm } from '@/components/forms/tiers-form';
import { SubscriptionConstraintsForm } from '@/components/forms/subscriptions-constraints-form';
import { ManualProviderForm } from '@/components/forms/subscriptions-provider-manual-form';
import { FortisProviderForm } from '@/components/forms/subscriptions-provider-fortis-form';
import { CryptoProviderForm } from '@/components/forms/subscriptions-provider-crypto-form';
import { StripeProviderForm } from '@/components/forms/subscriptions-provider-stripe-form';
import { PaypalProviderForm } from '@/components/forms/subscriptions-provider-paypal-form';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

// --- add: minimal runtime-safe types
type Provider = { Enabled?: boolean } & Record<string, unknown>;
type SubscriptionSettings = {
	Tiers?: TierConfig['Tiers'];
	Manual?: Provider;
	Fortis?: Provider;
	Crypto?: Provider;
	Stripe?: Provider;
	Paypal?: Provider;
};

export default async function SubscriptionSettingsPage() {
	const { Public } = await getAdminSettings();

	// --- fix: don't leave this as {}
	const sub = (Public?.Subscription ?? {}) as SubscriptionSettings;

	const tiersInitial: TierConfig = {
		Tiers: Array.isArray(sub.Tiers) ? sub.Tiers : [],
	};

	const openValues = [
		sub.Manual?.Enabled ? 'manual' : null,
		sub.Fortis?.Enabled ? 'fortis' : null,
		sub.Crypto?.Enabled ? 'crypto' : null,
		sub.Stripe?.Enabled ? 'stripe' : null,
		sub.Paypal?.Enabled ? 'paypal' : null,
	].filter(Boolean) as string[];

	return (
		<div className="container mx-auto space-y-8 py-8">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
				<p className="text-muted-foreground">
					Configure membership tiers, constraints, and providers.
				</p>
			</div>

			<TiersForm
				initial={tiersInitial}
				onSave={saveTiers}
			/>
			<SubscriptionConstraintsForm
				base={sub as any}
				initial={sub as any}
			/>

			<Accordion
				type="multiple"
				defaultValue={openValues}
				className="space-y-3"
			>
				<AccordionItem
					value="manual"
					className="rounded-md border"
				>
					<div className="flex items-center justify-between px-3">
						<AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<span className="font-medium">Manual</span>
								<Badge variant={sub.Manual?.Enabled ? 'default' : 'secondary'}>
									{sub.Manual?.Enabled ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
						</AccordionTrigger>
					</div>
					<AccordionContent className="px-3 pb-4">
						<ManualProviderForm base={sub as any} />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="fortis"
					className="rounded-md border"
				>
					<div className="flex items-center justify-between px-3">
						<AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<span className="font-medium">Fortis</span>
								<Badge variant={sub.Fortis?.Enabled ? 'default' : 'secondary'}>
									{sub.Fortis?.Enabled ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
						</AccordionTrigger>
					</div>
					<AccordionContent className="px-3 pb-4">
						<FortisProviderForm base={sub as any} />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="crypto"
					className="rounded-md border"
				>
					<div className="flex items-center justify-between px-3">
						<AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<span className="font-medium">Crypto</span>
								<Badge variant={sub.Crypto?.Enabled ? 'default' : 'secondary'}>
									{sub.Crypto?.Enabled ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
						</AccordionTrigger>
					</div>
					<AccordionContent className="px-3 pb-4">
						<CryptoProviderForm base={sub as any} />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="stripe"
					className="rounded-md border"
				>
					<div className="flex items-center justify-between px-3">
						<AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<span className="font-medium">Stripe</span>
								<Badge variant={sub.Stripe?.Enabled ? 'default' : 'secondary'}>
									{sub.Stripe?.Enabled ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
						</AccordionTrigger>
					</div>
					<AccordionContent className="px-3 pb-4">
						<StripeProviderForm base={sub as any} />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="paypal"
					className="rounded-md border"
				>
					<div className="flex items-center justify-between px-3">
						<AccordionTrigger className="flex-1 py-3 text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<span className="font-medium">PayPal</span>
								<Badge variant={sub.Paypal?.Enabled ? 'default' : 'secondary'}>
									{sub.Paypal?.Enabled ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
						</AccordionTrigger>
					</div>
					<AccordionContent className="px-3 pb-4">
						<PaypalProviderForm base={sub as any} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

async function saveTiers(val: TierConfig) {
	'use server';
	const { Public } = await getAdminSettings();
	const sub = (Public?.Subscription ?? {}) as SubscriptionSettings;
	const merged = { ...sub, Tiers: val.Tiers } as SubscriptionSettings;
	await modifyPublicSubscriptionSettings({ Data: merged } as any);
}

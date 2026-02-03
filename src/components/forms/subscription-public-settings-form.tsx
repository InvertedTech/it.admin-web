'use client';
import {
	SettingsForm,
	SettingsSection,
	SettingsTabs,
	ProviderTogglePanel,
	TierList,
} from '@/components/settings';
import {
	normalizeProviders,
	useProtoAppForm,
} from '@/hooks/use-proto-app-form';
import {
	SubscriptionProviderPublicStripeFieldGroup,
	SubscriptionProviderPublicManualFieldGroup,
	SubscriptionProviderPublicPaypalFieldGroup,
	SubscriptionProviderPublicFortisFieldGroup,
	SubscriptionProviderPublicCryptoFieldGroup,
} from './groups/settings';
import { ModifySubscriptionPublicDataRequestSchema } from '@inverted-tech/fragments/Settings';
import { SubscriptionTierSchema } from '@inverted-tech/fragments/Authorization/index';
import { create } from '@bufbuild/protobuf';
import { modifyPublicSubscriptionSettings } from '@/app/actions/settings';

type Props = { base?: any };

const stripe = {
	Enabled: 'Data.Stripe.Enabled',
	Url: 'Data.Stripe.Url',
} as const;

const paypal = {
	Enabled: 'Data.Paypal.Enabled',
	Url: 'Data.Paypal.Url',
	ClientID: 'Data.Paypal.ClientID',
} as const;

const fortis = {
	Enabled: 'Data.Fortis.Enabled',
	IsTest: 'Data.Fortis.IsTest',
} as const;

const manual = {
	Enabled: 'Data.Manual.Enabled',
} as const;

const crypto = {
	Enabled: 'Data.Crypto.Enabled',
} as const;

export function SubscriptionPublicSettingsForm({ base }: Props) {
	const defaults = create(ModifySubscriptionPublicDataRequestSchema, base);
	const form = useProtoAppForm({
		schema: ModifySubscriptionPublicDataRequestSchema,
		defaultValues: create(
			ModifySubscriptionPublicDataRequestSchema,
			defaults
		),
		normalizeBeforeValidate: normalizeProviders,
		onSubmitAsync: async ({ value }) => {
			const normalized = normalizeProviders(value);
			await modifyPublicSubscriptionSettings(normalized as any);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title='General'
				description='Global subscription settings.'
			>
				<div className='grid gap-3 md:grid-cols-3'>
					<form.AppField name='Data.AllowOther'>
						{(f: any) => <f.BooleanField label='Allow Other' />}
					</form.AppField>
					<form.AppField name='Data.MinimumAllowed'>
						{(f: any) => <f.BooleanField label='Minimum Allowed' />}
					</form.AppField>
					<form.AppField name='Data.MaximumAllowed'>
						{(f: any) => <f.BooleanField label='Maximum Allowed' />}
					</form.AppField>
				</div>
			</SettingsSection>

			<SettingsSection
				title='Payment Providers'
				description='Enable and configure providers shown to users.'
			>
				<SettingsTabs
					items={[
						{
							value: 'stripe',
							label: 'Stripe',
							content: (
								<ProviderTogglePanel
									form={form}
									enabledField={stripe.Enabled}
								>
									<SubscriptionProviderPublicStripeFieldGroup
										title=''
										form={form}
										fields={stripe as any}
									/>
								</ProviderTogglePanel>
							),
						},
						{
							value: 'paypal',
							label: 'PayPal',
							content: (
								<ProviderTogglePanel
									form={form}
									enabledField={paypal.Enabled}
								>
									<SubscriptionProviderPublicPaypalFieldGroup
										title=''
										form={form}
										fields={paypal as any}
									/>
								</ProviderTogglePanel>
							),
						},
						{
							value: 'fortis',
							label: 'Fortis',
							content: (
								<ProviderTogglePanel
									form={form}
									enabledField={fortis.Enabled}
								>
									<SubscriptionProviderPublicFortisFieldGroup
										title=''
										form={form}
										fields={fortis as any}
									/>
								</ProviderTogglePanel>
							),
						},
						{
							value: 'manual',
							label: 'Manual',
							content: (
								<ProviderTogglePanel
									form={form}
									enabledField={manual.Enabled}
								>
									<SubscriptionProviderPublicManualFieldGroup
										title=''
										form={form}
										fields={manual as any}
									/>
								</ProviderTogglePanel>
							),
						},
						{
							value: 'crypto',
							label: 'Crypto',
							content: (
								<ProviderTogglePanel
									form={form}
									enabledField={crypto.Enabled}
								>
									<SubscriptionProviderPublicCryptoFieldGroup
										title=''
										form={form}
										fields={crypto as any}
									/>
								</ProviderTogglePanel>
							),
						},
					]}
				/>
			</SettingsSection>

			<SettingsSection
				title='Tiers'
				description='Subscription tiers users can purchase.'
			>
				<TierList
					form={form}
					basePath='Data.Tiers'
					makeTier={() =>
						create(SubscriptionTierSchema, {
							Name: 'Tier',
							Description: '',
							Color: '#22c55e',
							AmountCents: 0,
						})
					}
				/>
			</SettingsSection>
		</SettingsForm>
	);
}

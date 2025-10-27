'use client';
import { create } from '@bufbuild/protobuf';
import {
	SettingsForm,
	SettingsSection,
	SettingsTabs,
} from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { ModifySubscriptionOwnerDataRequestSchema } from '@inverted-tech/fragments/Settings';
import {
	SubscriptionProviderStripOwnerFieldGroup,
	SubscriptionProviderPaypalOwnerFieldGroup,
	SubscriptionProviderFortisOwnerFieldGroup,
} from './groups/settings';

type Props = { base?: any };

const stripeOwner = {
	Account: 'Data.StripeOwner.Account',
	ClientID: 'Data.StripeOwner.ClientID',
	ClientSecret: 'Data.StripeOwner.ClientSecret',
} as const;
const paypalOwner = { ClientSecret: 'Data.PaypalOwner.ClientSecret' } as const;
const fortisOwner = {
	UserID: 'Data.FortisOwner.UserID',
	UserApiKey: 'Data.FortisOwner.UserApiKey',
	LocationID: 'Data.FortisOwner.LocationID',
	ProductID: 'Data.FortisOwner.ProductID',
} as const;

export function SubscriptionOwnerSettingsForm({ base }: Props) {
	const defaults = create(ModifySubscriptionOwnerDataRequestSchema, base ?? {});
	const form = useProtoAppForm({
		schema: ModifySubscriptionOwnerDataRequestSchema,
		defaultValues: defaults,
		onSubmitAsync: async ({ value }) => {
			const { modifyOwnerSubscriptionSettings } = await import(
				'@/app/actions/settings'
			);
			await modifyOwnerSubscriptionSettings(value as any);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title="Payment Providers (Owner)"
				description="Secrets and IDs."
			>
				<SettingsTabs
					items={[
						{
							value: 'stripe',
							label: 'Stripe',
							content: (
								<SettingsSection
									title="Stripe Owner"
									description="Account and API credentials."
								>
									<SubscriptionProviderStripOwnerFieldGroup
										form={form as any}
										fields={stripeOwner as any}
									/>
								</SettingsSection>
							),
						},
						{
							value: 'paypal',
							label: 'PayPal',
							content: (
								<SettingsSection
									title="PayPal Owner"
									description="API credentials."
								>
									<SubscriptionProviderPaypalOwnerFieldGroup
										form={form as any}
										fields={paypalOwner as any}
									/>
								</SettingsSection>
							),
						},
						{
							value: 'fortis',
							label: 'Fortis',
							content: (
								<SettingsSection
									title="Fortis Owner"
									description="User, keys, and IDs."
								>
									<SubscriptionProviderFortisOwnerFieldGroup
										form={form as any}
										fields={fortisOwner as any}
									/>
								</SettingsSection>
							),
						},
					]}
				/>
			</SettingsSection>
		</SettingsForm>
	);
}

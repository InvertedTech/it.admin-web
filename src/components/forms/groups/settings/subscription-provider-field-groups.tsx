'use client';

import { FieldGroup, FieldLegend } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { StripePublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Stripe/StripeSettings_pb';
import { ManualPaymentPublicSettingsSchema } from '@inverted-tech/fragments/protos/Authorization/Payment/Manual/ManualPaymentSettings_pb';
import { PaypalPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Paypal/PaypalSettings_pb';
import { FortisPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Fortis/FortisSettings_pb';
import { CryptoPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Crypto/CryptoSettings_pb';

const SubscriptionProviderPublicStripeFieldGroup = withFieldGroup({
	props: { title: 'Stripe' },
	defaultValues: create(StripePublicSettingsSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<FieldLegend>{title}</FieldLegend>
				<group.AppField
					name="Enabled"
					children={(field) => <field.BooleanField label="Enabled" />}
				/>
				<group.AppField
					name="Url"
					children={(field) => <field.TextField label="Checkout URL" />}
				/>
			</FieldGroup>
		);
	},
});

const SubscriptionProviderPublicManualFieldGroup = withFieldGroup({
	props: { title: 'Manual' },
	defaultValues: create(ManualPaymentPublicSettingsSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<FieldLegend>{title}</FieldLegend>
				<group.AppField
					name="Enabled"
					children={(field) => <field.BooleanField label="Enabled" />}
				/>
			</FieldGroup>
		);
	},
});

const SubscriptionProviderPublicPaypalFieldGroup = withFieldGroup({
	props: { title: 'Paypal' },
	defaultValues: create(PaypalPublicSettingsSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<FieldLegend>{title}</FieldLegend>
				<group.AppField
					name="Enabled"
					children={(field) => <field.BooleanField label="Enabled" />}
				/>
				<group.AppField
					name="Url"
					children={(field) => <field.TextField label="Checkout URL" />}
				/>
				<group.AppField
					name="ClientID"
					children={(field) => <field.TextField label="Client ID" />}
				/>
			</FieldGroup>
		);
	},
});

const SubscriptionProviderPublicFortisFieldGroup = withFieldGroup({
	props: { title: 'Fortis' },
	defaultValues: create(FortisPublicSettingsSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<FieldLegend>{title}</FieldLegend>
				<group.AppField
					name="Enabled"
					children={(field) => <field.BooleanField label="Enabled" />}
				/>
				<group.AppField
					name="IsTest"
					children={(field) => <field.BooleanField label="Test Mode" />}
				/>
			</FieldGroup>
		);
	},
});

const SubscriptionProviderPublicCryptoFieldGroup = withFieldGroup({
	props: { title: 'Crypto' },
	defaultValues: create(CryptoPublicSettingsSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<FieldLegend>{title}</FieldLegend>
				<group.AppField
					name="Enabled"
					children={(field) => <field.BooleanField label="Enabled" />}
				/>
			</FieldGroup>
		);
	},
});

export default {
	SubscriptionProviderPublicStripeFieldGroup,
	SubscriptionProviderPublicManualFieldGroup,
	SubscriptionProviderPublicPaypalFieldGroup,
	SubscriptionProviderPublicFortisFieldGroup,
	SubscriptionProviderPublicCryptoFieldGroup,
};

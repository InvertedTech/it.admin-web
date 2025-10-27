// src/components/forms/subscription-owner-settings-form.tsx
'use client';

import * as React from 'react';
import { create } from '@bufbuild/protobuf';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';

import { ModifySubscriptionOwnerDataRequestSchema } from '@inverted-tech/fragments/Settings';
import {
	SubscriptionProviderStripOwnerFieldGroup,
	SubscriptionProviderPaypalOwnerFieldGroup,
	SubscriptionProviderFortisOwnerFieldGroup,
} from './groups/settings';

// replace with your actual owner save action
import { modifyOwnerSubscriptionSettings } from '@/app/actions/settings';

type Props = { base?: any };

// Owner field maps only
const stripeOwner = {
	Account: 'Data.StripeOwner.Account',
	ClientID: 'Data.StripeOwner.ClientID',
	ClientSecret: 'Data.StripeOwner.ClientSecret',
} as const;

const paypalOwner = {
	ClientSecret: 'Data.PaypalOwner.ClientSecret',
} as const;

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
			await modifyOwnerSubscriptionSettings(value as any);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<form.AppForm>
				<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
					{(errs: any) => <FormSubmitErrors errors={errs} />}
				</form.Subscribe>

				<FormCard
					cardTitle="Payment Providers (Owner)"
					cardDescription="Secrets and IDs."
				>
					<Tabs
						defaultValue="stripe"
						className="w-full"
					>
						<TabsList className="flex w-full justify-start overflow-x-auto">
							<TabsTrigger value="stripe">Stripe</TabsTrigger>
							<TabsTrigger value="paypal">PayPal</TabsTrigger>
							<TabsTrigger value="fortis">Fortis</TabsTrigger>
						</TabsList>

						<TabsContent
							value="stripe"
							className="mt-4"
						>
							<FormCard
								cardTitle="Stripe Owner"
								cardDescription="Account and API credentials."
							>
								<FieldGroup>
									<SubscriptionProviderStripOwnerFieldGroup
										form={form as any}
										fields={stripeOwner as any}
									/>
								</FieldGroup>
							</FormCard>
						</TabsContent>

						<TabsContent
							value="paypal"
							className="mt-4"
						>
							<FormCard
								cardTitle="PayPal Owner"
								cardDescription="API credentials."
							>
								<FieldGroup>
									<SubscriptionProviderPaypalOwnerFieldGroup
										form={form as any}
										fields={paypalOwner as any}
									/>
								</FieldGroup>
							</FormCard>
						</TabsContent>

						<TabsContent
							value="fortis"
							className="mt-4"
						>
							<FormCard
								cardTitle="Fortis Owner"
								cardDescription="User, keys, and IDs."
							>
								<FieldGroup>
									<SubscriptionProviderFortisOwnerFieldGroup
										form={form as any}
										fields={fortisOwner as any}
									/>
								</FieldGroup>
							</FormCard>
						</TabsContent>
					</Tabs>
				</FormCard>

				<form.SaveChangesBar />
			</form.AppForm>
		</form>
	);
}

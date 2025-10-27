'use client';
// TODO: Implement
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from '@bufbuild/protobuf';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';

import { useProtoAppForm } from '@/hooks/use-proto-app-form';

// ACTION you already use elsewhere
import { modifyPublicSubscriptionSettings } from '@/app/actions/settings';

// If you have a request schema, use it here:

import { ModifySubscriptionPublicDataRequestSchema } from '@inverted-tech/fragments/Settings';

// Or import named:
import {
	SubscriptionProviderPublicStripeFieldGroup,
	SubscriptionProviderPublicManualFieldGroup,
	SubscriptionProviderPublicPaypalFieldGroup,
	SubscriptionProviderPublicFortisFieldGroup,
	SubscriptionProviderPublicCryptoFieldGroup,
} from './groups/settings';
import { SubscriptionTierSchema } from '@inverted-tech/fragments/Authorization/index';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const read = (obj: any, path: string) =>
	path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
type Props = { base?: any };

const stripeFields = {
	Enabled: 'Data.Stripe.Enabled',
	Url: 'Data.Stripe.Url',
} as const;

const paypalFields = {
	Enabled: 'Data.Paypal.Enabled',
	Url: 'Data.Paypal.Url',
	ClientID: 'Data.Paypal.ClientID',
} as const;

const fortisFields = {
	Enabled: 'Data.Fortis.Enabled',
	IsTest: 'Data.Fortis.IsTest',
} as const;

const manualFields = {
	Enabled: 'Data.Manual.Enabled',
} as const;

const cryptoFields = {
	Enabled: 'Data.Crypto.Enabled',
} as const;

export function SubscriptionPublicSettingsForm({ base }: Props) {
	// Normalize defaults to expected shape
	const defaults = create(ModifySubscriptionPublicDataRequestSchema, base);
	const form = useProtoAppForm({
		schema: ModifySubscriptionPublicDataRequestSchema,
		defaultValues: create(ModifySubscriptionPublicDataRequestSchema, defaults),
		onSubmitAsync: async ({ value }) => {
			await modifyPublicSubscriptionSettings(value as any);
		},
	});

	// Tier helpers
	const addTier = () => {
		const list = (form.state.values?.Data?.Tiers ?? []) as any[];
		form.setFieldValue('Data.Tiers' as any, [
			...list,
			create(SubscriptionTierSchema, {
				Name: `Tier ${list.length + 1}`,
				Description: '',
				Color: '#22c55e',
				AmountCents: 0,
			}),
		]);
	};
	const removeTier = (i: number) => {
		const list = (form.state.values?.Data?.Tiers ?? []) as any[];
		form.setFieldValue(
			'Data.Tiers' as any,
			list.slice(0, i).concat(list.slice(i + 1))
		);
	};

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

				{/* General */}
				<FormCard
					cardTitle="General"
					cardDescription="Global subscription settings."
				>
					<FieldGroup>
						<div className="grid gap-3 md:grid-cols-3">
							<form.AppField name="Data.AllowOther">
								{(f) => <f.BooleanField label="Allow Other" />}
							</form.AppField>
							<form.AppField name="Data.MinimumAllowed">
								{(f) => <f.BooleanField label="Minimum Allowed" />}
							</form.AppField>
							<form.AppField name="Data.MaximumAllowed">
								{(f) => <f.BooleanField label="Maximum Allowed" />}
							</form.AppField>
						</div>
					</FieldGroup>
				</FormCard>

				{/* Providers */}

				<FormCard
					cardTitle="Payment Providers"
					cardDescription="Enable and configure providers shown to users."
				>
					<FieldGroup>
						<Tabs
							defaultValue="stripe"
							className="w-full"
						>
							<TabsList className="flex w-full justify-start overflow-x-auto">
								<TabsTrigger value="stripe">Stripe</TabsTrigger>
								<TabsTrigger value="paypal">PayPal</TabsTrigger>
								<TabsTrigger value="fortis">Fortis</TabsTrigger>
								<TabsTrigger value="manual">Manual</TabsTrigger>
								<TabsTrigger value="crypto">Crypto</TabsTrigger>
							</TabsList>

							{/* Stripe */}
							<TabsContent
								value="stripe"
								className="mt-4"
							>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Status</div>
									<div className="min-w-[220px]">
										<form.AppField name={stripeFields.Enabled}>
											{(f) => <f.BooleanField label="Enabled" />}
										</form.AppField>
									</div>
								</div>
								<form.Subscribe
									selector={(s: any) => !!read(s?.values, stripeFields.Enabled)}
								>
									{(on: boolean) =>
										on ? (
											<div className="mt-4 grid gap-3">
												<SubscriptionProviderPublicStripeFieldGroup
													title=""
													form={form}
													fields={stripeFields as any}
												/>
											</div>
										) : null
									}
								</form.Subscribe>
							</TabsContent>

							{/* PayPal */}
							<TabsContent
								value="paypal"
								className="mt-4"
							>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Status</div>
									<div className="min-w-[220px]">
										<form.AppField name={paypalFields.Enabled}>
											{(f) => <f.BooleanField label="Enabled" />}
										</form.AppField>
									</div>
								</div>
								<form.Subscribe
									selector={(s: any) => !!read(s?.values, paypalFields.Enabled)}
								>
									{(on: boolean) =>
										on ? (
											<div className="mt-4 grid gap-3">
												<SubscriptionProviderPublicPaypalFieldGroup
													title=""
													form={form}
													fields={paypalFields as any}
												/>
											</div>
										) : null
									}
								</form.Subscribe>
							</TabsContent>

							{/* Fortis */}
							<TabsContent
								value="fortis"
								className="mt-4"
							>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Status</div>
									<div className="min-w-[220px]">
										<form.AppField name={fortisFields.Enabled}>
											{(f) => <f.BooleanField label="Enabled" />}
										</form.AppField>
									</div>
								</div>
								<form.Subscribe
									selector={(s: any) => !!read(s?.values, fortisFields.Enabled)}
								>
									{(on: boolean) =>
										on ? (
											<div className="mt-4 grid gap-3">
												<SubscriptionProviderPublicFortisFieldGroup
													title=""
													form={form}
													fields={fortisFields as any}
												/>
											</div>
										) : null
									}
								</form.Subscribe>
							</TabsContent>

							{/* Manual */}
							<TabsContent
								value="manual"
								className="mt-4"
							>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Status</div>
									<div className="min-w-[220px]">
										<form.AppField name={manualFields.Enabled}>
											{(f) => <f.BooleanField label="Enabled" />}
										</form.AppField>
									</div>
								</div>
								<form.Subscribe
									selector={(s: any) => !!read(s?.values, manualFields.Enabled)}
								>
									{(on: boolean) =>
										on ? (
											<div className="mt-4 grid gap-3">
												<SubscriptionProviderPublicManualFieldGroup
													title=""
													form={form}
													fields={manualFields as any}
												/>
											</div>
										) : null
									}
								</form.Subscribe>
							</TabsContent>

							{/* Crypto */}
							<TabsContent
								value="crypto"
								className="mt-4"
							>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Status</div>
									<div className="min-w-[220px]">
										<form.AppField name={cryptoFields.Enabled}>
											{(f) => <f.BooleanField label="Enabled" />}
										</form.AppField>
									</div>
								</div>
								<form.Subscribe
									selector={(s: any) => !!read(s?.values, cryptoFields.Enabled)}
								>
									{(on: boolean) =>
										on ? (
											<div className="mt-4 grid gap-3">
												<SubscriptionProviderPublicCryptoFieldGroup
													title=""
													form={form}
													fields={cryptoFields as any}
												/>
											</div>
										) : null
									}
								</form.Subscribe>
							</TabsContent>
						</Tabs>
					</FieldGroup>
				</FormCard>

				{/* Tiers */}
				<FormCard
					cardTitle="Tiers"
					cardDescription="Subscription tiers users can purchase."
				>
					<FieldGroup>
						<div className="mb-2 flex items-center justify-between">
							<FieldLabel>Manage</FieldLabel>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addTier}
							>
								Add tier
							</Button>
						</div>

						<form.Subscribe
							selector={(s: any) => (s?.values?.Data?.Tiers ?? []) as any[]}
						>
							{(tiers) =>
								tiers.length === 0 ? (
									<div className="text-sm text-muted-foreground border rounded p-3">
										No tiers added.
									</div>
								) : (
									tiers.map((_: any, i: number) => (
										<div
											key={i}
											className="mb-4 rounded border p-3"
										>
											<div className="mb-2 flex justify-end">
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() => removeTier(i)}
												>
													Remove
												</Button>
											</div>
											{/* Reuse your tier group at array index */}
											{/* If your SubscriptionTierFieldGroup is exported elsewhere, import and use it here: */}
											{/* <SubscriptionTierFieldGroup name={`Data.Tiers.${i}`} /> */}
											{/* Inline fields to avoid another import: */}
											<div className="grid gap-3 md:grid-cols-2">
												<form.AppField name={`Data.Tiers.${i}.Name`}>
													{(f) => <f.TextField label="Name" />}
												</form.AppField>
												<form.AppField name={`Data.Tiers.${i}.AmountCents`}>
													{(f) => <f.MoneyCentsField label="Amount (Cents)" />}
												</form.AppField>
												<form.AppField name={`Data.Tiers.${i}.Description`}>
													{(f) => <f.TextField label="Description" />}
												</form.AppField>
												<form.AppField name={`Data.Tiers.${i}.Color`}>
													{(f) => <f.ColorField label="Color" />}
												</form.AppField>
											</div>
										</div>
									))
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</FormCard>

				<form.SaveChangesBar />
			</form.AppForm>
		</form>
	);
}

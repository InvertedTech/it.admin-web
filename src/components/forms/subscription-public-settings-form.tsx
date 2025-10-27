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

// Schemas
import { SubscriptionTierSchema } from '@inverted-tech/fragments/protos/Authorization/SharedTypes_pb';

// If you have a request schema, use it here:
import { ModifyPublicSubscriptionSettingsRequestSchema } from '@inverted-tech/fragments/Settings';

// Provider field-groups you posted
import Providers from './<path-to-your-file>/index'; // default export with groups
// Or import named:
// import {
//   SubscriptionProviderPublicStripeFieldGroup,
//   SubscriptionProviderPublicManualFieldGroup,
//   SubscriptionProviderPublicPaypalFieldGroup,
//   SubscriptionProviderPublicFortisFieldGroup,
//   SubscriptionProviderPublicCryptoFieldGroup,
// } from './groups/subscriptions/providers';

type Props = { base?: any };

export function SubscriptionPublicSettingsForm({ base }: Props) {
	// Normalize defaults to expected shape
	const defaults = {
		Data: {
			AllowOther: base?.Data?.AllowOther ?? false,
			MinimumAllowed: base?.Data?.MinimumAllowed ?? false,
			MaximumAllowed: base?.Data?.MaximumAllowed ?? false,
			Tiers: base?.Data?.Tiers ?? [],
			// provider public settings
			Stripe: base?.Data?.Stripe ?? {},
			Paypal: base?.Data?.Paypal ?? {},
			Fortis: base?.Data?.Fortis ?? {},
			Manual: base?.Data?.Manual ?? {},
			Crypto: base?.Data?.Crypto ?? {},
		},
	};

	const form = useProtoAppForm({
		schema: ModifyPublicSubscriptionSettingsRequestSchema as any,
		defaultValues: create(
			ModifyPublicSubscriptionSettingsRequestSchema as any,
			defaults
		),
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
			className='space-y-6'
		>
			<form.AppForm>
				<form.Subscribe
					selector={(s: any) => s?.submitErrors ?? s?.errors}
				>
					{(errs: any) => <FormSubmitErrors errors={errs} />}
				</form.Subscribe>

				{/* General */}
				<FormCard
					cardTitle='General'
					cardDescription='Global subscription settings.'
				>
					<FieldGroup>
						<div className='grid gap-3 md:grid-cols-3'>
							<form.AppField name='Data.AllowOther'>
								{(f) => <f.BooleanField label='Allow Other' />}
							</form.AppField>
							<form.AppField name='Data.MinimumAllowed'>
								{(f) => (
									<f.BooleanField label='Minimum Allowed' />
								)}
							</form.AppField>
							<form.AppField name='Data.MaximumAllowed'>
								{(f) => (
									<f.BooleanField label='Maximum Allowed' />
								)}
							</form.AppField>
						</div>
					</FieldGroup>
				</FormCard>

				{/* Providers */}
				<FormCard
					cardTitle='Payment Providers'
					cardDescription='Enable and configure providers shown to users.'
				>
					<FieldGroup>
						<div className='grid gap-6 md:grid-cols-2'>
							{/* Mount each under its public settings path */}
							<Providers.SubscriptionProviderPublicStripeFieldGroup name='Data.Stripe' />
							<Providers.SubscriptionProviderPublicPaypalFieldGroup name='Data.Paypal' />
							<Providers.SubscriptionProviderPublicFortisFieldGroup name='Data.Fortis' />
							<Providers.SubscriptionProviderPublicManualFieldGroup name='Data.Manual' />
							<Providers.SubscriptionProviderPublicCryptoFieldGroup name='Data.Crypto' />
						</div>
					</FieldGroup>
				</FormCard>

				{/* Tiers */}
				<FormCard
					cardTitle='Tiers'
					cardDescription='Subscription tiers users can purchase.'
				>
					<FieldGroup>
						<div className='mb-2 flex items-center justify-between'>
							<FieldLabel>Manage</FieldLabel>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addTier}
							>
								Add tier
							</Button>
						</div>

						<form.Subscribe
							selector={(s: any) =>
								(s?.values?.Data?.Tiers ?? []) as any[]
							}
						>
							{(tiers) =>
								tiers.length === 0 ? (
									<div className='text-sm text-muted-foreground border rounded p-3'>
										No tiers added.
									</div>
								) : (
									tiers.map((_: any, i: number) => (
										<div
											key={i}
											className='mb-4 rounded border p-3'
										>
											<div className='mb-2 flex justify-end'>
												<Button
													type='button'
													variant='destructive'
													size='sm'
													onClick={() =>
														removeTier(i)
													}
												>
													Remove
												</Button>
											</div>
											{/* Reuse your tier group at array index */}
											{/* If your SubscriptionTierFieldGroup is exported elsewhere, import and use it here: */}
											{/* <SubscriptionTierFieldGroup name={`Data.Tiers.${i}`} /> */}
											{/* Inline fields to avoid another import: */}
											<div className='grid gap-3 md:grid-cols-2'>
												<form.AppField
													name={`Data.Tiers.${i}.Name`}
												>
													{(f) => (
														<f.TextField label='Name' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Tiers.${i}.AmountCents`}
												>
													{(f) => (
														<f.MoneyCentsField label='Amount (Cents)' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Tiers.${i}.Description`}
												>
													{(f) => (
														<f.TextField label='Description' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Tiers.${i}.Color`}
												>
													{(f) => (
														<f.ColorField label='Color' />
													)}
												</form.AppField>
											</div>
										</div>
									))
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</FormCard>

				{/* Submit bar */}
				<div className='sticky bottom-4 z-10'>
					<div className='rounded-xl border bg-background/80 backdrop-blur p-3 flex justify-end'>
						<form.Subscribe
							selector={(s: any) => !!s?.isSubmitting}
						>
							{(isSubmitting: boolean) => (
								<Button type='submit' disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Spinner className='mr-2' />{' '}
											Saving...
										</>
									) : (
										'Save changes'
									)}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form.AppForm>
		</form>
	);
}

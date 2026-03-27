import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import React from 'react';
import { Shopify } from '@inverted-tech/fragments/Merch';
import { ShopifyPublicSettingsSchema } from '@inverted-tech/fragments/Merch/Shopify';

const { ShopifyStoreConfigSchema } = Shopify;

export const ShopifyStoreConfigFieldGroup = withFieldGroup({
	defaultValues: create(ShopifyStoreConfigSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField name='InternalStoreID'>
					{(f) => <f.HiddenField />}
				</group.AppField>
				<group.AppField name='StoreName'>
					{(f) => <f.TextField label='Store Name' />}
				</group.AppField>
				<group.AppField name='StoreAdminToken'>
					{(f) => <f.PasswordField label='Shopify Admin Token' />}
				</group.AppField>
				<group.AppField name='StorefrontDomain'>
					{(f) => <f.TextField label='Shopify Storefront Domain' />}
				</group.AppField>
				<group.AppField name='CollectionIds'>
					{(f) => <f.TextListField label='Collection Ids' />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

export const ShopifyPublicSettingsFieldGroup = withFieldGroup({
	defaultValues: create(ShopifyPublicSettingsSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField name='IsEnabled'>
					{(f) => <f.BooleanField label='Enabled' />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

const STORES_PATH = 'Data.Shopify.Stores';

export function ShopifyOwnerSettingsFieldGroup({ form }: { form: any }) {
	const add = () => {
		const list = (form.state.values?.Data?.Shopify?.Stores ?? []) as any[];
		form.setFieldValue(STORES_PATH as any, [
			...list,
			create(ShopifyStoreConfigSchema),
		]);
	};

	const remove = (i: number) => {
		const list = (form.state.values?.Data?.Shopify?.Stores ?? []) as any[];
		form.setFieldValue(
			STORES_PATH as any,
			list.filter((_: any, idx: number) => idx !== i),
		);
	};

	return (
		<div>
			<div className='mb-2 flex items-center justify-between'>
				<FieldLabel>Stores</FieldLabel>
				<Button type='button' variant='outline' size='sm' onClick={add}>
					Add Store
				</Button>
			</div>
			<form.Subscribe
				selector={(s: any) =>
					(s?.values?.Data?.Shopify?.Stores ?? []) as any[]
				}
			>
				{(stores: any[]) =>
					stores.length === 0 ? (
						<div className='rounded border p-3 text-sm text-muted-foreground'>
							No stores configured.
						</div>
					) : (
						stores.map((_: any, i: number) => (
							<div key={i} className='mb-4 rounded border p-3'>
								<div className='mb-2 flex justify-end'>
									<Button
										type='button'
										variant='destructive'
										size='sm'
										onClick={() => remove(i)}
									>
										Remove
									</Button>
								</div>
								<FieldGroup>
									<form.AppField
										name={`${STORES_PATH}.${i}.InternalStoreID` as any}
									>
										{(f: any) => <f.HiddenField />}
									</form.AppField>
									<form.AppField
										name={`${STORES_PATH}.${i}.StoreName` as any}
									>
										{(f: any) => <f.TextField label='Store Name' />}
									</form.AppField>
									<form.AppField
										name={`${STORES_PATH}.${i}.StoreAdminToken` as any}
									>
										{(f: any) => (
											<f.PasswordField label='Admin Token' />
										)}
									</form.AppField>
									<form.AppField
										name={`${STORES_PATH}.${i}.StorefrontDomain` as any}
									>
										{(f: any) => (
											<f.TextField label='Storefront Domain' />
										)}
									</form.AppField>
									<form.AppField
										name={`${STORES_PATH}.${i}.CollectionIds` as any}
									>
										{(f: any) => (
											<f.TextListField label='Collection IDs' />
										)}
									</form.AppField>
								</FieldGroup>
							</div>
						))
					)
				}
			</form.Subscribe>
		</div>
	);
}

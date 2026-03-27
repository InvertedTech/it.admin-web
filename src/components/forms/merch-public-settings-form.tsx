'use client';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { ModifyMerchPublicSettingsRequestSchema } from '@inverted-tech/fragments/Settings';
import { SettingsForm, SettingsSection, SettingsTabs } from '../settings';
import { ShopifyPublicSettingsFieldGroup } from './groups';

const shopify = {
	IsEnabled: 'Data.Shopify.IsEnabled',
} as const;

type Props = { base?: any };

export function MerchPublicSettingsForm({ base }: Props) {
	const defaults = create(ModifyMerchPublicSettingsRequestSchema, base);
	const form = useProtoAppForm({
		schema: ModifyMerchPublicSettingsRequestSchema,
		defaultValues: create(ModifyMerchPublicSettingsRequestSchema, defaults),
		onSubmitAsync: async ({ value }) => {
			const { modifyMerchPublicSettings } = await import(
				'@/app/actions/settings'
			);
			await modifyMerchPublicSettings(value as any);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title='Shopify'
				description='Shopify Public Settings'
			>
				<div className='grid gap-3 md:grid-cols-3'>
					<SettingsTabs
						items={[
							{
								value: 'shopify',
								label: 'Shopify',
								content: (
									<ShopifyPublicSettingsFieldGroup
										form={form}
										fields={shopify as any}
									/>
								),
							},
						]}
					/>
				</div>
			</SettingsSection>
		</SettingsForm>
	);
}

'use client';
import { create } from '@bufbuild/protobuf';
import { SettingsForm, SettingsSection, SettingsTabs } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { ModifyMerchOwnerSettingsRequestSchema } from '@inverted-tech/fragments/Settings';
import { ShopifyOwnerSettingsFieldGroup } from './groups/settings/shopify-settings-field-groups';

type Props = { base?: any };

export function MerchOwnerSettingsForm({ base }: Props) {
	const defaults = create(ModifyMerchOwnerSettingsRequestSchema, base ?? {});
	const form = useProtoAppForm({
		schema: ModifyMerchOwnerSettingsRequestSchema,
		defaultValues: defaults,
		onSubmitAsync: async ({ value }) => {
			const { modifyMerchOwnerSettings } = await import(
				'@/app/actions/settings'
			);
			await modifyMerchOwnerSettings(value as any);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title='Shopify (Owner)'
				description='Shopify store credentials and configuration.'
			>
				<SettingsTabs
					items={[
						{
							value: 'shopify',
							label: 'Shopify',
							content: <ShopifyOwnerSettingsFieldGroup form={form} />,
						},
					]}
				/>
			</SettingsSection>
		</SettingsForm>
	);
}

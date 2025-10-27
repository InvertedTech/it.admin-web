// src/components/forms/notifications-owner-settings-form.tsx
'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	SettingsForm,
	SettingsSection,
	SettingsTabs,
} from '@/components/settings';
import { ModifySubscriptionOwnerDataRequestSchema } from '@inverted-tech/fragments/Settings';

import { SendgridOwnerSettingsFieldGroup } from './groups/settings/notification-settings-field-groups';

type Props = { base?: any; onSubmit?: (v: any) => Promise<void> | void };

const sendgridOwner = {
	Enabled: 'Data.Notification.Sendgrid.Enabled',
	ApiKeySecret: 'Data.Notification.Sendgrid.ApiKeySecret',
	SendFromAddress: 'Data.Notification.Sendgrid.SendFromAddress',
} as const;

export function NotificationsOwnerSettingsForm({ base, onSubmit }: Props) {
	const defaults = create(ModifySubscriptionOwnerDataRequestSchema, base ?? {});
	const form = useProtoAppForm({
		schema: ModifySubscriptionOwnerDataRequestSchema,
		defaultValues: defaults,
		onSubmitAsync: async ({ value }) => {
			if (onSubmit) return onSubmit(value);
			const { modifyOwnerSubscriptionSettings } = await import(
				'@/app/actions/settings'
			);
			await modifyOwnerSubscriptionSettings(value as any);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title="Notifications Providers (Owner)"
				description="Secrets, sender addresses, and provider options."
			>
				<SettingsTabs
					items={[
						{
							value: 'sendgrid',
							label: 'SendGrid',
							content: (
								<SendgridOwnerSettingsFieldGroup
									form={form as any}
									fields={sendgridOwner as any}
								/>
							),
						},
					]}
				/>
			</SettingsSection>
		</SettingsForm>
	);
}

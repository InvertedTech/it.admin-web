// src/components/forms/notifications-owner-settings-form.tsx
'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	SettingsForm,
	SettingsSection,
	SettingsTabs,
} from '@/components/settings';
import { ModifyNotificationOwnerDataRequestSchema } from '@inverted-tech/fragments/Settings';

import { SendgridOwnerSettingsFieldGroup } from './groups/settings/notification-settings-field-groups';

type Props = { base?: any; onSubmit?: (v: any) => Promise<void> | void };

const sendgridOwner = {
    Enabled: 'Data.Sendgrid.Enabled',
    ApiKeySecret: 'Data.Sendgrid.ApiKeySecret',
    SendFromAddress: 'Data.Sendgrid.SendFromAddress',
} as const;

export function NotificationsOwnerSettingsForm({ base, onSubmit }: Props) {
    const defaults = create(ModifyNotificationOwnerDataRequestSchema, base ?? {});
    const form = useProtoAppForm({
        schema: ModifyNotificationOwnerDataRequestSchema,
        defaultValues: defaults,
        onSubmitAsync: async ({ value }) => {
            if (onSubmit) return onSubmit(value);
            const { modifyNotificationsOwnerSettings } = await import(
                '@/app/actions/settings'
            );
            await modifyNotificationsOwnerSettings(value as any);
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

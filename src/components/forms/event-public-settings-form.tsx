'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	EventPublicSettings,
	EventPublicSettingsSchema,
} from '@inverted-tech/fragments/Authorization/Events/index';
import { EventPublicSettingsFieldGroup } from './groups/settings/event-settings-field-groups';

export function EventPublicSettingsForm({
    data,
}: {
    data?: EventPublicSettings;
}) {
    // Map logical field names to form paths for the field group
    const fields = {
        TicketClasses: 'TicketClasses',
    } as const;
	const form = useProtoAppForm({
		schema: EventPublicSettingsSchema,
		defaultValues: data as any,
		onValidSubmit: async ({ value }) => {
			// For now, just log submitted values
			// eslint-disable-next-line no-console
			console.log('Submitting event public settings', value);
		},
	});

	return (
        <SettingsForm form={form}>
            <SettingsSection
                title="Public"
                description="Manage ticket classes and pricing."
            >
                <EventPublicSettingsFieldGroup
                    form={form as any}
                    fields={fields as any}
                />
            </SettingsSection>
        </SettingsForm>
    );
}

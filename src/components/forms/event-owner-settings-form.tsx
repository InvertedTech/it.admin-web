'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { EventOwnerSettingsSchema } from '@inverted-tech/fragments/Authorization/Events/index';

export function EventOwnerSettingsForm({ base }: { base?: any }) {
	const form = useProtoAppForm({
		schema: EventOwnerSettingsSchema,
		defaultValues: base as any,
		onValidSubmit: async ({ value }) => {
			// For now, just log submitted values
			// eslint-disable-next-line no-console
			console.log('Submitting event owner settings', value);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title="Owner"
				description="Control event system features."
			>
				<form.AppField name="IsEnabled">
					{(f: any) => <f.SwitchField label="Events Enabled" />}
				</form.AppField>
			</SettingsSection>
		</SettingsForm>
	);
}

'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { EventOwnerSettingsSchema } from '@inverted-tech/fragments/Authorization/Events/index';
import { useRouter } from 'next/navigation';

export function EventOwnerSettingsForm({ base }: { base?: any }) {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: EventOwnerSettingsSchema,
		defaultValues: base as any,
		onSubmitAsync: async ({ value }) => {
			const { modifyEventsOwnerSettings } = await import(
				'@/app/actions/settings'
			);
			await modifyEventsOwnerSettings({ Data: value } as any);
			try { router.refresh(); } catch {}
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

'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	PersonalizationPublicRecord,
	PersonalizationPublicRecordSchema,
} from '@inverted-tech/fragments/Settings/SettingsRecord_pb';

// shared wrappers
import { SettingsForm, SettingsSection } from '@/components/settings';

export function PersonalizationPublicForm({
	data,
}: {
	data?: PersonalizationPublicRecord;
}) {
	const form = useProtoAppForm({
		schema: PersonalizationPublicRecordSchema,
		defaultValues: data,
		onValidSubmit: async ({ value }) => {
			console.log('Submitting personalization settings', value);
		},
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title="Public Personalization"
				description="Control what visitors see before they sign in."
			>
				<FieldGroup>
					<form.AppField name="Title">
						{(f) => <f.TextField label="Title" />}
					</form.AppField>

					<form.AppField name="DefaultToDarkMode">
						{(f) => <f.SwitchField label="Default To Dark Mode" />}
					</form.AppField>

					<form.AppField name="MetaDescription">
						{(f) => <f.TextField label="Meta Description" />}
					</form.AppField>

					<form.AppField name="ProfileImageAssetId">
						{(f: any) => <f.ImagePickerField label="Profile Image" />}
					</form.AppField>

					<form.AppField name="HeaderImageAssetId">
						{(f) => <f.ImagePickerField label="Header Image" />}
					</form.AppField>

					<Field>
						<Button type="reset">Cancel</Button>
						<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
							{(isSubmitting: boolean) => (
								<Button
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Spinner className="mr-2" />
											Saving...
										</>
									) : (
										'Save'
									)}
								</Button>
							)}
						</form.Subscribe>
					</Field>
				</FieldGroup>
			</SettingsSection>
		</SettingsForm>
	);
}

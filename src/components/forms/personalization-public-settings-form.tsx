'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import {
	PersonalizationPublicRecord,
	PersonalizationPublicRecordSchema,
} from '@inverted-tech/fragments/Settings/SettingsRecord_pb';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';

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
		<FormCard
			cardTitle="Public Personalization"
			cardDescription="Control what visitors see before they sign in."
		>
			<form
				id="persosnalization-public"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					{/* Form-level validation errors from TanStack submit result */}
					{
						<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
							{(errs: any) => <FormSubmitErrors errors={errs} />}
						</form.Subscribe>
					}

					<FieldGroup>
						<form.AppField
							name="Title"
							children={(field) => <field.TextField label="Title" />}
						/>
						<form.AppField
							name="DefaultToDarkMode"
							children={(field) => (
								<field.SwitchField label="Default To Dark Mode" />
							)}
						/>
						<form.AppField
							name="MetaDescription"
							children={(field) => <field.TextField label="Meta Description" />}
						/>

						<form.AppField
							name="ProfileImageAssetId"
							children={(field: any) => (
								<field.ImagePickerField label="Profile Image" />
							)}
						/>

						<form.AppField
							name="HeaderImageAssetId"
							children={(field) => (
								<field.ImagePickerField label="Header Image" />
							)}
						/>

						<Field>
							<Button type="reset">Cancel</Button>
							{
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
							}
						</Field>
					</FieldGroup>
				</form.AppForm>
			</form>
		</FormCard>
	);
}

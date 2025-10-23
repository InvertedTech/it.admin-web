'use client';

import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import { PersonalizationPublicRecordSchema } from '@inverted-tech/fragments/Settings/SettingsRecord_pb';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';

export function PersonalizationPublicForm() {
	const form = useProtoAppForm({
		schema: PersonalizationPublicRecordSchema,
		onValidSubmit: async ({ value }) => {
			// TODO: Persist settings via an action/API
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
						children={(field) => (
							<field.TextField label="Profile Image Asset ID" />
						)}
					/>

					<form.AppField
						name="HeaderImageAssetId"
						children={(field) => (
							<field.TextField label="Header Image Asset ID" />
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
			</form>
		</FormCard>
	);
}

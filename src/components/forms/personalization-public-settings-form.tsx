'use client';

import type { CSSProperties } from 'react';
 
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { FormFieldItem } from './form-field-item';
import { Spinner } from '@/components/ui/spinner';
import { PersonalizationPublicRecordSchema } from '@inverted-tech/fragments/Settings/SettingsRecord_pb';
import { useProtoForm } from '@/hooks/use-proto-form';



export function PersonalizationPublicForm() {
	const form = useProtoForm({
		schema: PersonalizationPublicRecordSchema,
		onValidSubmit: async ({ value }) => {
			// TODO: Persist settings via an action/API
			console.log('Submitting personalization settings', value);
		},
	});

	return (
		<FormCard
			cardTitle='Public Personalization'
			cardDescription='Control what visitors see before they sign in.'
		>
			<form id='persosnalization-public' onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
				{/* Form-level validation errors from TanStack submit result */}
				{(
					<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
						{(errs: any) => <FormSubmitErrors errors={errs} />}
					</form.Subscribe>
				)}

				<FieldGroup>
					<form.Field
						name="Title"
						children={(field) => (
							<FormFieldItem field={field}>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="off"
								/>
							</FormFieldItem>
						)}
					/>
					<form.Field
						name="DefaultToDarkMode"
						children={(field) => (
							<FormFieldItem field={field}>
								<Switch
									id={field.name}
									name={field.name}
									checked={!!field.state.value}
									onCheckedChange={(v) => field.handleChange(!!v)}
								/>
							</FormFieldItem>
						)}
					/>
					<form.Field
						name="MetaDescription"
						children={(field) => (
							<FormFieldItem field={field}>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="off"
								/>
							</FormFieldItem>
						)}
					/>

					<form.Field
						name="ProfileImageAssetId"
						children={(field) => (
							<FormFieldItem field={field}>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="off"
								/>
							</FormFieldItem>
						)}
					/>

					<form.Field
						name="HeaderImageAssetId"
						children={(field) => (
							<FormFieldItem field={field}>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="off"
								/>
							</FormFieldItem>
						)}
					/>
					<Field>
						<Button type='reset'>Cancel</Button>
						{(
							<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
								{(isSubmitting: boolean) => (
									<Button type='submit' disabled={isSubmitting}>
										{isSubmitting ? (
											<>
												<Spinner className='mr-2' />
												Saving...
											</>
										) : (
											'Save'
										)}
									</Button>
								)}
							</form.Subscribe>
						)}
					</Field>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

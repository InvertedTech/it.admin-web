'use client';

import type { CSSProperties } from 'react';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormCard } from './form-card';
import { PersonalizationPublicRecordSchema } from '@inverted-tech/fragments/schemas/IT/WebServices/Fragments/Settings/SettingsRecord';

export function PersonalizationPublicForm() {
	const form = useForm({
		defaultValues: {
			Title: '',
			MetaDescription: '',
			DefaultToDarkMode: false,
			ProfileImageAssetId: '',
			HeaderImageAssetId: '',
		},
		validators: {
			onSubmit: PersonalizationPublicRecordSchema,
		},
		onSubmit: ({ value }) => {
			console.log(value);
			const payload = {
				...value,
				ProfileImageAssetId: value.ProfileImageAssetId || undefined,
				HeaderImageAssetId: value.HeaderImageAssetId || undefined,
			};

			toast('Public personalization saved', {
				description: (
					<pre className='bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4'>
						<code>{JSON.stringify(payload, null, 2)}</code>
					</pre>
				),
				position: 'bottom-right',
				classNames: {
					content: 'flex flex-col gap-2',
				},
				style: {
					'--border-radius': 'calc(var(--radius)  + 4px)',
				} as CSSProperties,
			});
		},
	});

	return (
		<FormCard
			cardTitle='Public Personalization'
			cardDescription='Control what visitors see before they sign in.'
		>
			<form
				id='personalization-public-settings-form'
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field
						name='Title'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Site Title
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder='Acme Media'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									<FieldDescription>
										Display name for SEO and landing pages.
									</FieldDescription>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							);
						}}
					/>

					<form.Field
						name='MetaDescription'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Meta Description
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder='Short summary for search and link previews'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									<FieldDescription>
										Keep it concise&mdash;this shows up in
										SEO snippets and social previews.
									</FieldDescription>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							);
						}}
					/>

					<form.Field
						name='DefaultToDarkMode'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;

							return (
								<Field
									data-invalid={isInvalid}
									orientation='horizontal'
								>
									<FieldLabel htmlFor={field.name}>
										Dark mode by default
									</FieldLabel>
									<div className='flex flex-col gap-1.5'>
										<Switch
											id={field.name}
											name={field.name}
											checked={field.state.value}
											onCheckedChange={(checked) =>
												field.handleChange(checked)
											}
											onBlur={field.handleBlur}
											aria-checked={field.state.value}
											aria-invalid={isInvalid}
										/>
										<FieldDescription>
											Enable to load the site in dark mode
											for first-time visitors.
										</FieldDescription>
										{isInvalid && (
											<FieldError
												errors={field.state.meta.errors}
											/>
										)}
									</div>
								</Field>
							);
						}}
					/>

					<form.Field
						name='ProfileImageAssetId'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Profile Image Asset ID
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder='Optional asset identifier'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							);
						}}
					/>

					<form.Field
						name='HeaderImageAssetId'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Header Image Asset ID
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder='Optional asset identifier'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							);
						}}
					/>

					<Field>
						<Button type='submit'>Save Settings</Button>
						<Button variant='outline' type='button'>
							Cancel
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

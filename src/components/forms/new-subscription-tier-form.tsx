'use client';

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { SubscriptionTierSchema } from '@inverted-tech/fragments/Authorization/index';

import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { FormCard } from './form-card';

type NewSubscriptionTierValues = {
	Name: string;
	Description: string;
	Color: string;
	AmountCents: string | number;
};

export function NewSubscriptionTierForm() {
	const form = useProtoAppForm({
		schema: SubscriptionTierSchema,
		defaultValues: {
			Name: '',
			Description: '',
			Color: '',
			AmountCents: '0',
		} as NewSubscriptionTierValues,
		normalizeBeforeValidate: (value) => ({
			...value,
			AmountCents: Number(value.AmountCents),
		}),
		onValidSubmit: ({ value }) => {
			const payload = {
				...value,
				AmountCents: Number(value.AmountCents),
			};

			// TODO: Send Request
			// TODO: Handle Response
			console.log(payload);
		},
	});

	return (
		<FormCard
			cardTitle='Create Tier'
			cardDescription='Create A New Subscription Tier For Your Monetization'
		>
			<form
				id='new-subscription-tier-form'
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field
						name='Name'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Name
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type='text'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value,
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
						name='Description'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Description
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type='text'
										placeholder='Describe what this tier unlocks'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value,
											)
										}
										aria-invalid={isInvalid}
									/>
									<FieldDescription>
										This appears on the paywall and lets
										subscribers know what&apos;s included.
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
						name='Color'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Accent Color
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type='text'
										placeholder='#0055FF'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value,
											)
										}
										aria-invalid={isInvalid}
									/>
									<FieldDescription>
										Use a hex value to personalize this tier
										in the UI.
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
						name='AmountCents'
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Monthly Price (cents)
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type='number'
										min={0}
										step={100}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value,
											)
										}
										aria-invalid={isInvalid}
									/>
									<FieldDescription>
										Enter the amount in cents (e.g. 999 for
										$9.99).
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
					<Field>
						<Button type='submit'>Create Tier</Button>
						<Button variant='outline' type='button'>
							Cancel
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

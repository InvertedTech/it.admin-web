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

import { FormCard } from './form-card';

// TODO: Replace Zod with generated req/res schemas from @inverted-tech/fragments/schemas
const NewSubscriptionTierRequestSchema = z.object({
	Name: z.string().nonempty('Name must not be empty'),
	Description: z.string(),
	Color: z
		.string()
		.trim()
		.regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
			message: 'Use a valid 3 or 6 digit hex color (e.g. #0055FF)',
		}),
	AmountCents: z
		.string()
		.trim()
		.min(1, { message: 'Price is required' })
		.refine((value) => /^\d+$/.test(value), {
			message: 'Enter digits only',
		})
		.refine((value) => Number(value) >= 0, {
			message: 'The Minimum Amount Is 0',
		})
		.refine((value) => Number(value) <= 10_000_000, {
			message: 'Value must be less than 10,000,000',
		}),
});

export function NewSubscriptionTierForm() {
	const form = useForm({
		defaultValues: {
			Name: '',
			Description: '',
			Color: '',
			AmountCents: '0',
		},
		validators: {
			onSubmit: NewSubscriptionTierRequestSchema,
		},
		onSubmit: ({ value }) => {
			const payload = {
				...value,
				AmountCents: Number(value.AmountCents),
			};

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
												event.target.value
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
												event.target.value
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
												event.target.value
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

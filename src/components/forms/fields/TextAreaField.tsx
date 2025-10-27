'use client';
import React from 'react';
import { useStore } from '@tanstack/react-form';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function TextAreaField({
	label,
	description,
	disabled,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
}) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();
	const errState = useStore(form.store as any, (s: any) => ({
		submit: s?.submitErrors,
		sync: s?.errors,
	}));

	const submitField =
		matchFieldErrors(errState?.submit?.fields as any, field.name) ?? [];
	const syncField =
		matchFieldErrors(errState?.sync?.fields as any, field.name) ?? [];
	const base = Array.isArray(field.state.meta.errors)
		? (field.state.meta.errors as any)
		: [];
	const errors =
		normalizeFieldErrors([...base, ...submitField, ...syncField] as any) ??
		[];
	const isInvalid = errors.length > 0;

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				value={(field.state.value ?? '') as string}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				disabled={disabled}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={errors} />}
		</UIField>
	);
}

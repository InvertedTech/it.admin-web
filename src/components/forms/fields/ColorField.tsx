'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function ColorField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(s: any) => ({
				submit: s?.submitErrors,
				sync: s?.errors,
			})}
		>
			{(errState: any) => {
				const submitField =
					matchFieldErrors(
						errState?.submit?.fields as any,
						field.name
					) ?? [];
				const syncField =
					matchFieldErrors(
						errState?.sync?.fields as any,
						field.name
					) ?? [];
				const base = Array.isArray(field.state.meta.errors)
					? (field.state.meta.errors as any)
					: [];
				const errors =
					normalizeFieldErrors([
						...base,
						...submitField,
						...syncField,
					] as any) ?? [];
				const isInvalid = errors.length > 0;

				const v = field.state.value || '#7c3aed';

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<div className='flex items-center gap-2'>
							<Input
								id={field.name}
								type='color'
								className='h-9 w-12 p-1'
								value={v}
								onChange={(e) =>
									field.handleChange(e.target.value)
								}
							/>
							<Input
								value={v}
								onChange={(e) =>
									field.handleChange(e.target.value)
								}
								placeholder='#7c3aed'
							/>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

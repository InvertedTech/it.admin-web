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

export function MoneyCentsField({
	label,
	min = 0,
	step = 100,
}: {
	label?: React.ReactNode;
	min?: number;
	step?: number;
}) {
	const field = useFieldContext<number | undefined>();
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

				const cents = Number(field.state.value ?? 0);
				const usd = new Intl.NumberFormat(undefined, {
					style: 'currency',
					currency: 'USD',
				}).format((Number.isFinite(cents) ? cents : 0) / 100);

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<div className='relative'>
							<Input
								id={field.name}
								type='number'
								inputMode='numeric'
								min={min}
								step={step}
								value={String(field.state.value ?? 0)}
								onChange={(e) =>
									field.handleChange(Number(e.target.value))
								}
								className='pr-24'
							/>
							<span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
								≈ {usd}/mo
							</span>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

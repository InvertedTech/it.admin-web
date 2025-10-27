// src/components/ui/field/number-field.tsx
'use client';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function NumberField({
	label,
	description,
	disabled,
	min,
	max,
	step = 1,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	min?: number;
	max?: number;
	step?: number;
}) {
	const field = useFieldContext<number | undefined>();
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
				const submitField =
					matchFieldErrors(errState?.submit?.fields as any, field.name) ?? [];
				const syncField =
					matchFieldErrors(errState?.sync?.fields as any, field.name) ?? [];
				const combined = [
					...(Array.isArray(field.state.meta.errors)
						? (field.state.meta.errors as any)
						: []),
					...submitField,
					...syncField,
				];
				const errors = normalizeFieldErrors(combined as any) ?? [];
				const isInvalid = errors.length > 0;

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<Input
							id={field.name}
							name={field.name}
							type="number"
							inputMode="numeric"
							value={field.state.value ?? ''} // keep controlled
							onBlur={field.handleBlur}
							onChange={(e) => {
								const v = e.target.value;
								if (v === '') return field.handleChange(undefined);
								const n = Number(v);
								field.handleChange(Number.isNaN(n) ? undefined : n);
							}}
							min={min}
							max={max}
							step={step}
							aria-invalid={isInvalid}
							autoComplete="off"
							disabled={disabled}
						/>
						{description && <FieldDescription>{description}</FieldDescription>}
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

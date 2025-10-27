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

export function TextField({
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
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Input
							id={field.name}
							name={field.name}
							value={(field.state.value ?? '') as string}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={isInvalid}
							autoComplete='off'
							disabled={disabled}
						/>
						{description && (
							<FieldDescription>{description}</FieldDescription>
						)}
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

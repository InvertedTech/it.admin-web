'use client';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

export function MFAField({
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
						<InputOTP
							id="digits-only"
							maxLength={6}
							pattern={REGEXP_ONLY_DIGITS}
							disabled={disabled}
							aria-invalid={isInvalid}
							autoComplete="off"
							value={field.state.value ?? ''}
							onBlur={field.handleBlur}
							onChange={(e) => {
								const v = e;
								if (v === '') return field.handleChange(undefined);
								field.handleChange(v);
							}}
						>
						<InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border-l *:data-[slot=input-otp-slot]:border-white/80 *:data-[slot=input-otp-slot]:data-[active=true]:border-white *:data-[slot=input-otp-slot]:data-[active=true]:ring-white/40">
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
						</InputOTP>
						{description && <FieldDescription>{description}</FieldDescription>}
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

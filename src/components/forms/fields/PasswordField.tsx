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
import { Eye, EyeOff } from 'lucide-react';

export function PasswordField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const [show, setShow] = React.useState(false);
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

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<div className='relative'>
							<Input
								id={field.name}
								name={field.name}
								type={show ? 'text' : 'password'}
								autoComplete={show ? 'off' : 'current-password'}
								placeholder={show ? '' : '••••••••'}
								value={(field.state.value ?? '') as string}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(e.target.value)
								}
								aria-invalid={isInvalid}
							/>
							<button
								type='button'
								aria-label={
									show ? 'Hide password' : 'Show password'
								}
								className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded p-1'
								onClick={() => setShow((v) => !v)}
							>
								{show ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

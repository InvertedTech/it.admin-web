'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import { cn } from '@/lib/utils';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Badge } from '@/components/ui/badge';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import { Power, PowerOff } from 'lucide-react';

export function SwitchField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<boolean | undefined>();
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
				const checked = !!field.state.value;

				return (
					<UIField data-invalid={isInvalid} orientation='responsive'>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>

						<InputGroup className='w-fit'>
							<button
								id={field.name}
								name={field.name}
								type='button'
								role='switch'
								aria-checked={checked}
								aria-invalid={isInvalid}
								data-slot='input-group-control'
								onClick={() => field.handleChange(!checked)}
								className={cn(
									'relative h-9 w-20 rounded-full border p-1 outline-none transition-colors',
									checked
										? 'bg-emerald-500 border-emerald-500'
										: 'bg-muted border-border'
								)}
							>
								<span
									className={cn(
										'absolute top-1 left-1 h-7 w-7 rounded-full bg-background shadow-sm',
										'grid place-items-center transition-transform duration-200 will-change-transform',
										checked && 'translate-x-11'
									)}
								>
									{checked ? (
										<Power className='h-4 w-4 text-emerald-600' />
									) : (
										<PowerOff className='h-4 w-4 text-muted-foreground' />
									)}
								</span>
							</button>

							<InputGroupAddon align='inline-end'>
								<Badge
									variant={checked ? 'default' : 'secondary'}
									className={cn(
										'h-6 w-12 justify-center px-0 text-xs font-medium',
										checked
											? 'bg-emerald-600 text-white hover:bg-emerald-600'
											: ''
									)}
								>
									{checked ? 'On' : 'Off'}
								</Badge>
							</InputGroupAddon>
						</InputGroup>

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

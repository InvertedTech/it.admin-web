'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import { cn } from '@/lib/utils';
import { Power, PowerOff } from 'lucide-react';

export function BooleanField({
	label,
	onLabel = 'Enabled',
	offLabel = 'Disabled',
}: {
	label?: React.ReactNode;
	onLabel?: React.ReactNode;
	offLabel?: React.ReactNode;
}) {
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
				const value = !!field.state.value;

				return (
					<UIField data-invalid={isInvalid} orientation='responsive'>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>

						<ToggleGroup
							type='single'
							value={value ? 'on' : 'off'}
							onValueChange={(v) =>
								v && field.handleChange(v === 'on')
							}
							className='w-fit'
							variant='outline'
							size='lg'
						>
							<ToggleGroupItem
								value='on'
								className={cn(
									'flex items-center gap-2 px-3 transition-colors',
									'data-[state=on]:bg-emerald-500 data-[state=on]:text-white',
									'data-[state=on]:hover:bg-emerald-600'
								)}
							>
								<Power className='h-4 w-4' />
								<span className='text-sm font-medium'>
									{onLabel}
								</span>
							</ToggleGroupItem>
							<ToggleGroupItem
								value='off'
								className={cn(
									'flex items-center gap-2 px-3 transition-colors',
									'data-[state=on]:bg-muted data-[state=on]:text-muted-foreground',
									'data-[state=on]:hover:bg-muted/80'
								)}
							>
								<PowerOff className='h-4 w-4' />
								<span className='text-sm font-medium'>
									{offLabel}
								</span>
							</ToggleGroupItem>
						</ToggleGroup>

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

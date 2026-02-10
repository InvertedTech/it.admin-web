'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
	FieldDescription,
} from '@/components/ui/field';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type PageSizes = 10 | 25 | 50 | 100;

export function PageSizeField({
	label,
	description,
	value = 25,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	value: PageSizes;
}) {
	const field = useFieldContext<number>();
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
						field.name,
					) ?? [];
				const syncField =
					matchFieldErrors(
						errState?.sync?.fields as any,
						field.name,
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
						<Select
							value={String(field.state.value ?? value)}
							onValueChange={(v) => {
								const nextSize = Number(v) as PageSizes;
								field.handleChange(nextSize);
							}}
						>
							<SelectTrigger className='h-8 w-[88px]'>
								<SelectValue
									defaultValue={String(value)}
									id={field.name}
									aria-invalid={isInvalid}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='10'>10</SelectItem>
								<SelectItem value='25'>25</SelectItem>
								<SelectItem value='50'>50</SelectItem>
								<SelectItem value='100'>100</SelectItem>
							</SelectContent>
						</Select>
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

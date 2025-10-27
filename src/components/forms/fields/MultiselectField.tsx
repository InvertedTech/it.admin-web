'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function MultiSelectField({
	label,
	options = [],
	placeholder = 'Add or select...',
}: {
	label?: React.ReactNode;
	options?: string[];
	placeholder?: string;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [input, setInput] = React.useState('');

	const value = Array.isArray(field.state.value)
		? (field.state.value as string[])
		: [];

	function addItem(tag: string) {
		const t = tag.trim();
		if (!t || value.includes(t)) return;
		field.handleChange([...(value as string[]), t]);
		setInput('');
	}
	function removeItem(tag: string) {
		const next = value.filter((v) => v !== tag);
		field.handleChange(next);
	}

	const available = (options || []).filter((o) => !value.includes(o));

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

						<div className='flex flex-wrap items-center gap-2'>
							{value.length === 0 && (
								<div className='text-muted-foreground text-sm'>
									No items selected
								</div>
							)}
							{value.map((tag) => (
								<button
									key={tag}
									type='button'
									className='border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs'
									onClick={() => removeItem(tag)}
									aria-label={`Remove ${tag}`}
								>
									<span>{tag}</span>
									<XIcon className='h-3 w-3 opacity-60' />
								</button>
							))}
						</div>

						<div className='mt-2 flex items-center gap-2'>
							<input
								className='border-input bg-background text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 text-sm outline-hidden'
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={placeholder}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addItem(input);
									}
								}}
							/>
							<Button
								type='button'
								variant='outline'
								onClick={() => addItem(input)}
							>
								Add
							</Button>
						</div>

						{available.length > 0 && (
							<div className='text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs'>
								<span>Suggestions:</span>
								{available.map((opt) => (
									<button
										key={opt}
										type='button'
										onClick={() => addItem(opt)}
										className='hover:bg-accent/50 border-input text-foreground rounded border px-2 py-0.5'
									>
										{opt}
									</button>
								))}
							</div>
						)}

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

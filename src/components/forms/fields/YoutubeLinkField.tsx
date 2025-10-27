'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Youtube } from 'lucide-react';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

function extractYouTubeId(url: string): string | null {
	try {
		const u = new URL(url);
		if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
		if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
		return null;
	} catch {
		return null;
	}
}

export function YoutubeLinkField({ label }: { label?: React.ReactNode }) {
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
				const currentVal = field.state.value ?? '';

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? 'YouTube Link'}
						</FieldLabel>
						<div className='relative flex items-center'>
							<Youtube className='absolute left-3 h-4 w-4 text-muted-foreground' />
							<Input
								id={field.name}
								name={field.name}
								type='url'
								placeholder='https://www.youtube.com/watch?v=xxxxxxx'
								value={currentVal}
								onChange={(e) => {
									const url = e.target.value;
									const id = extractYouTubeId(url);
									field.handleChange(id ?? url);
								}}
								onBlur={field.handleBlur}
								aria-invalid={isInvalid}
								className='pl-9'
							/>
						</div>
						{isInvalid && <FieldError errors={errors} />}
						{currentVal && (
							<p className='text-xs text-muted-foreground mt-1'>
								Extracted ID:{' '}
								<span className='font-mono'>{currentVal}</span>
							</p>
						)}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

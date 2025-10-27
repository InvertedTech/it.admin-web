'use client';
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useStore } from '@tanstack/react-form';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { CmsBodyTextarea } from '@/components/ui/CMSTextArea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function HtmlBodyField({
	label,
	description,
	disabled,
	placeholder = 'Write HTML…',
	maxLength,
	rows = 12,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	rows?: number;
}) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();
	const errState = useStore(form.store as any, (s: any) => ({
		submit: s?.submitErrors,
		sync: s?.errors,
	}));

	const submitField =
		matchFieldErrors(errState?.submit?.fields as any, field.name) ?? [];
	const syncField =
		matchFieldErrors(errState?.sync?.fields as any, field.name) ?? [];
	const base = Array.isArray(field.state.meta.errors)
		? (field.state.meta.errors as any)
		: [];
	const errors =
		normalizeFieldErrors([...base, ...submitField, ...syncField] as any) ??
		[];
	const isInvalid = errors.length > 0;

	const [open, setOpen] = React.useState(false);
	const html = (field.state.value ?? '') as string;
	const safe = React.useMemo(
		() => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
		[html]
	);

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

			<CmsBodyTextarea
				id={field.name}
				label={undefined}
				description={
					typeof description === 'string' ? description : undefined
				}
				placeholder={placeholder}
				value={html}
				onChange={(v) => field.handleChange(v)}
				onPreview={() => setOpen(true)}
				maxLength={maxLength}
				disabled={disabled}
				rows={rows}
				error={
					isInvalid
						? errors[0]?.message ?? 'Invalid value'
						: undefined
				}
				className='mt-1'
			/>

			{description && (
				<FieldDescription className='mt-1'>
					{description}
				</FieldDescription>
			)}
			{isInvalid && <FieldError errors={errors} />}

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='max-w-3xl'>
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
					</DialogHeader>
					<div
						className='prose dark:prose-invert max-w-none'
						dangerouslySetInnerHTML={{ __html: safe }}
					/>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

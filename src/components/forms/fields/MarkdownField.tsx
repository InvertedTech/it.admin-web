'use client';
import React from 'react';
import { useStore } from '@tanstack/react-form';
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
	ShadcnTemplate,
	type ShadcnTemplateRef,
} from '@/components/lexkit/shadcn/ShadcnTemplate';

const CONVENTIONAL_HEADERS = [
	'## About',
	'## Role Overview',
	'## Responsibilities',
	'## Qualifications',
];

export function MarkdownField({
	label,
	description,
	disabled,
	placeholder,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
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
		normalizeFieldErrors([...base, ...submitField, ...syncField] as any) ?? [];
	const isInvalid = errors.length > 0;

	const editorRef = React.useRef<ShadcnTemplateRef | null>(null);
	const lastLocalValue = React.useRef<string | null>(null);
	const readyOnce = React.useRef(false);

	const value = (field.state.value ?? '') as string;

	const handleReady = React.useCallback(() => {
		if (readyOnce.current) return;
		readyOnce.current = true;
		if (!editorRef.current) return;
		editorRef.current.injectMarkdown(value);
		lastLocalValue.current = value;
	}, [value]);

	React.useEffect(() => {
		if (!editorRef.current) return;
		if (lastLocalValue.current === value) return;
		editorRef.current.injectMarkdown(value);
	}, [value]);

	const missingHeaders = CONVENTIONAL_HEADERS.filter(
		(header) => !value.includes(header),
	);
	const showHeaderWarning =
		!isInvalid && value.trim().length > 0 && missingHeaders.length > 0;

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}

			<div className='mt-2'>
				<ShadcnTemplate
					ref={editorRef}
					placeholder={placeholder}
					readOnly={disabled}
					onReady={handleReady}
					onContentChange={(_html, markdown) => {
						lastLocalValue.current = markdown;
						field.handleChange(markdown);
					}}
				/>
			</div>

			{showHeaderWarning && (
				<p className='text-xs text-muted-foreground mt-1'>
					Missing conventional section
					{missingHeaders.length > 1 ? 's' : ''}: {missingHeaders.join(', ')}
				</p>
			)}

			{isInvalid && <FieldError errors={errors} />}
		</UIField>
	);
}

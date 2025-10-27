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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Toggle } from '@/components/ui/toggle';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Eye,
	Bold,
	Italic,
	Link as LinkIcon,
	Heading3,
	List,
	Quote,
	Code,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

type Mode = 'markdown' | 'html';

export function RichBodyField({
	label,
	description,
	disabled,
	placeholder = 'Write content…',
	rows = 14,
	mode: initialMode = 'html',
	maxLength,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
	rows?: number;
	mode?: Mode;
	maxLength?: number;
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
	const [mode, setMode] = React.useState<Mode>(initialMode);
	const taRef = React.useRef<HTMLTextAreaElement | null>(null);

	const value = (field.state.value ?? '') as string;
	const charCount = value.length;

	function replaceSelection(
		before: string,
		after = '',
		transform?: (s: string) => string
	) {
		const ta = taRef.current;
		if (!ta) return;
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const selected = value.slice(start, end);
		const inner = transform ? transform(selected) : selected || 'text';
		const next =
			value.slice(0, start) + before + inner + after + value.slice(end);
		field.handleChange(next);
		queueMicrotask(() => {
			const pos = start + before.length + inner.length + after.length;
			ta.setSelectionRange(pos, pos);
			ta.focus();
		});
	}

	const actions = {
		bold: () => (mode === 'markdown' ? replaceSelection('**', '**') : null),
		italic: () => (mode === 'markdown' ? replaceSelection('_', '_') : null),
		h3: () =>
			mode === 'markdown'
				? replaceSelection('### ', '', (s) => s || 'Heading')
				: null,
		ul: () =>
			mode === 'markdown'
				? replaceSelection('', '', (s) =>
						(s || 'item')
							.split(/\n/)
							.map((l) => `- ${l || 'item'}`)
							.join('\n')
				  )
				: null,
		quote: () =>
			mode === 'markdown'
				? replaceSelection('', '', (s) =>
						(s || 'quote')
							.split(/\n/)
							.map((l) => `> ${l || 'quote'}`)
							.join('\n')
				  )
				: null,
		code: () =>
			mode === 'markdown'
				? replaceSelection('```\n', '\n```', (s) => s || 'code')
				: null,
		link: () =>
			mode === 'markdown'
				? replaceSelection('[', '](https://)', (s) => s || 'link text')
				: null,
		h3_html: () =>
			mode === 'html'
				? replaceSelection('<h3>', '</h3>', (s) => s || 'Heading')
				: null,
		b_html: () =>
			mode === 'html' ? replaceSelection('<strong>', '</strong>') : null,
		i_html: () =>
			mode === 'html' ? replaceSelection('<em>', '</em>') : null,
		ul_html: () =>
			mode === 'html'
				? replaceSelection('', '', (s) => {
						const lines = (s || 'item').split(/\n/);
						const lis = lines
							.map((l) => `<li>${l || 'item'}</li>`)
							.join('');
						return `<ul>${lis}</ul>`;
				  })
				: null,
		blockquote_html: () =>
			mode === 'html'
				? replaceSelection(
						'<blockquote>',
						'</blockquote>',
						(s) => s || 'quote'
				  )
				: null,
		code_html: () =>
			mode === 'html'
				? replaceSelection(
						'<pre><code>',
						'</code></pre>',
						(s) => s || 'code'
				  )
				: null,
		link_html: () =>
			mode === 'html'
				? replaceSelection(
						'<a href="https://">',
						'</a>',
						(s) => s || 'link text'
				  )
				: null,
	};

	const safeHtml = React.useMemo(
		() =>
			mode === 'html'
				? DOMPurify.sanitize(value, { USE_PROFILES: { html: true } })
				: '',
		[mode, value]
	);

	return (
		<UIField data-invalid={isInvalid}>
			<div className='flex items-center justify-between'>
				<FieldLabel htmlFor={field.name}>
					{label ?? field.name}
				</FieldLabel>

				<div className='flex items-center gap-2'>
					<Button
						type='button'
						size='sm'
						variant='secondary'
						onClick={() => setOpen(true)}
						className='h-8'
					>
						<Eye className='mr-1 h-3.5 w-3.5' />
						Preview
					</Button>

					{mode === 'markdown' ? (
						<div className='flex items-center gap-1'>
							<Toggle
								size='sm'
								aria-label='Bold'
								onPressedChange={() => actions.bold?.()}
							>
								<Bold className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='Italic'
								onPressedChange={() => actions.italic?.()}
							>
								<Italic className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='Heading 3'
								onPressedChange={() => actions.h3?.()}
							>
								<Heading3 className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='List'
								onPressedChange={() => actions.ul?.()}
							>
								<List className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='Quote'
								onPressedChange={() => actions.quote?.()}
							>
								<Quote className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='Code block'
								onPressedChange={() => actions.code?.()}
							>
								<Code className='h-4 w-4' />
							</Toggle>
							<Toggle
								size='sm'
								aria-label='Link'
								onPressedChange={() => actions.link?.()}
							>
								<LinkIcon className='h-4 w-4' />
							</Toggle>
						</div>
					) : null}
				</div>
			</div>

			<InputGroup className='mt-1'>
				<Textarea
					ref={taRef}
					id={field.name}
					name={field.name}
					data-slot='input-group-control'
					className='min-h-48 resize-y field-sizing-content px-3 py-2 text-base'
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					value={value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={isInvalid}
					maxLength={maxLength}
				/>
				<InputGroupAddon align='block-end'>
					<span
						className='px-2 py-1 text-xs text-muted-foreground tabular-nums'
						aria-live='polite'
					>
						{value.length}
						{typeof maxLength === 'number'
							? ` / ${maxLength}`
							: ''}{' '}
						chars
					</span>
				</InputGroupAddon>
			</InputGroup>

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
					<div className='prose dark:prose-invert max-w-none max-h-[70vh] overflow-auto'>
						{mode === 'markdown' ? (
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{value}
							</ReactMarkdown>
						) : (
							<div
								dangerouslySetInnerHTML={{ __html: safeHtml }}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

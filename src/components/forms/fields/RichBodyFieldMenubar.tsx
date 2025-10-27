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
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

type Mode = 'markdown' | 'html';

export function RichBodyFieldMenubar({
	label,
	description,
	disabled,
	placeholder = 'Write content…',
	rows = 14,
	mode: initialMode = 'markdown',
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
	const safeHtml = React.useMemo(
		() =>
			mode === 'html'
				? DOMPurify.sanitize(value, { USE_PROFILES: { html: true } })
				: '',
		[mode, value]
	);

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

	const md = {
		bold: () => replaceSelection('**', '**'),
		italic: () => replaceSelection('_', '_'),
		h3: () => replaceSelection('### ', '', (s) => s || 'Heading'),
		ul: () =>
			replaceSelection('', '', (s) =>
				(s || 'item')
					.split(/\n/)
					.map((l) => `- ${l || 'item'}`)
					.join('\n')
			),
		quote: () =>
			replaceSelection('', '', (s) =>
				(s || 'quote')
					.split(/\n/)
					.map((l) => `> ${l || 'quote'}`)
					.join('\n')
			),
		code: () => replaceSelection('```\n', '\n```', (s) => s || 'code'),
		link: () =>
			replaceSelection('[', '](https://)', (s) => s || 'link text'),
	};

	const html = {
		bold: () => replaceSelection('<strong>', '</strong>'),
		italic: () => replaceSelection('<em>', '</em>'),
		h3: () => replaceSelection('<h3>', '</h3>', (s) => s || 'Heading'),
		ul: () =>
			replaceSelection('', '', (s) => {
				const lines = (s || 'item').split(/\n/);
				const lis = lines
					.map((l) => `<li>${l || 'item'}</li>`)
					.join('');
				return `<ul>${lis}</ul>`;
			}),
		quote: () =>
			replaceSelection(
				'<blockquote>',
				'</blockquote>',
				(s) => s || 'quote'
			),
		code: () =>
			replaceSelection(
				'<pre><code>',
				'</code></pre>',
				(s) => s || 'code'
			),
		link: () =>
			replaceSelection(
				'<a href="https://">',
				'</a>',
				(s) => s || 'link text'
			),
	};

	const A = mode === 'markdown' ? md : html;

	return (
		<UIField data-invalid={isInvalid}>
			<div className='flex items-center justify-between'>
				<FieldLabel htmlFor={field.name}>
					{label ?? field.name}
				</FieldLabel>

				<Menubar className='h-9'>
					<MenubarMenu>
						<MenubarTrigger>Mode</MenubarTrigger>
						<MenubarContent>
							<MenubarItem
								onClick={() => setMode('markdown')}
								inset
							>
								Markdown{' '}
								{mode === 'markdown' && (
									<MenubarShortcut>✓</MenubarShortcut>
								)}
							</MenubarItem>
							<MenubarItem onClick={() => setMode('html')} inset>
								HTML{' '}
								{mode === 'html' && (
									<MenubarShortcut>✓</MenubarShortcut>
								)}
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger>Format</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={A.bold}>
								Bold <MenubarShortcut>Ctrl+B</MenubarShortcut>
							</MenubarItem>
							<MenubarItem onClick={A.italic}>
								Italic <MenubarShortcut>Ctrl+I</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={A.h3}>Heading 3</MenubarItem>
							<MenubarItem onClick={A.ul}>
								Bullet List
							</MenubarItem>
							<MenubarItem onClick={A.quote}>
								Blockquote
							</MenubarItem>
							<MenubarItem onClick={A.code}>
								Code Block
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={A.link}>Link…</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger>
							<span className='ml-0 tabular-nums text-xs'>
								{value.length}
								{typeof maxLength === 'number'
									? ` / ${maxLength}`
									: ''}{' '}
								chars
							</span>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger>
							<Eye className='mr-2 h-3.5 w-3.5' /> Preview
						</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={() => setOpen(true)}>
								Open Preview
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			</div>

			<InputGroup className='mt-2'>
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

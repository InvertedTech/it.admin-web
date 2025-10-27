// components/forms/cms-body-textarea.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // used under the hood by InputGroupTextarea styles
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, Eye } from 'lucide-react';

/**
 * CMS body textarea with counters and preview hook.
 * Use inside a form. Controlled or uncontrolled.
 */
export type CmsBodyTextareaProps = {
	id?: string;
	label?: string;
	placeholder?: string;
	defaultValue?: string;
	value?: string;
	onChange?: (v: string) => void;
	onPreview?: () => void;
	maxLength?: number;
	disabled?: boolean;
	required?: boolean;
	description?: string;
	error?: string;
	className?: string;
	rows?: number;
};

export function CmsBodyTextarea({
	id = 'cms-body',
	label = 'Body',
	placeholder = 'Write your article in Markdown…',
	defaultValue,
	value,
	onChange,
	onPreview,
	maxLength,
	disabled,
	required,
	description = 'Supports Markdown. Paste images to upload. Use ### for headings.',
	error,
	className,
	rows = 12,
}: CmsBodyTextareaProps) {
	const [internal, setInternal] = React.useState(defaultValue ?? '');
	const text = value ?? internal;
	const chars = text.length;
	const words = text.trim() ? text.trim().split(/\s+/).length : 0;
	const descId = `${id}-desc`;
	const errId = `${id}-err`;
	const helpId = error ? errId : descId;

	function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const v = e.target.value;
		if (onChange) onChange(v);
		else setInternal(v);
	}

	return (
		<div className={cn('grid gap-2', className)}>
			<div className="flex items-center justify-between">
				<Label
					htmlFor={id}
					className="text-sm"
				>
					{label}{' '}
					{required ? <span className="text-destructive">*</span> : null}
				</Label>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-describedby={helpId}
								className="inline-flex h-5 w-5 items-center justify-center rounded"
								tabIndex={-1}
							>
								<Info
									className="h-4 w-4"
									aria-hidden="true"
								/>
							</button>
						</TooltipTrigger>
						<TooltipContent
							side="left"
							align="end"
							className="max-w-80"
						>
							{description}
						</TooltipContent>
					</Tooltip>
					<span aria-live="polite">
						{words} words • {chars}
						{typeof maxLength === 'number' ? ` / ${maxLength}` : ''} chars
					</span>
				</div>
			</div>

			<InputGroup>
				{/* Use data-slot to get InputGroup focus ring behavior */}
				<Textarea
					id={id}
					data-slot="input-group-control"
					placeholder={placeholder}
					className={cn(
						'min-h-40 resize-y field-sizing-content px-3 py-2',
						'text-base leading-6',
						'dark:bg-input/30',
						error && 'ring-1 ring-destructive focus-visible:ring-destructive'
					)}
					value={text}
					onChange={handleChange}
					maxLength={maxLength}
					disabled={disabled}
					required={required}
					aria-invalid={!!error}
					aria-describedby={helpId}
					rows={rows}
				/>

				<InputGroupAddon align="block-end">
					{onPreview ? (
						<InputGroupButton
							size="sm"
							type="button"
							aria-label="Preview"
							onClick={onPreview}
							className="gap-1"
						>
							<Eye className="h-3.5 w-3.5" />
							Preview
						</InputGroupButton>
					) : null}
				</InputGroupAddon>
			</InputGroup>

			{error ? (
				<p
					id={errId}
					role="alert"
					className="text-sm text-destructive"
				>
					{error}
				</p>
			) : (
				<p
					id={descId}
					className="text-xs text-muted-foreground"
				>
					{description}
				</p>
			)}
		</div>
	);
}

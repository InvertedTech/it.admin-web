'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import { ContentType } from '@inverted-tech/fragments/Content';
import {
	Field as UIField,
	FieldError,
	FieldLabel,
	FieldDescription,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function ContentTypeSelectField({
	label = 'Content Type',
	description = 'Filter By Written, Video, or Audio',
	placeholder = 'Select content type...',
	noneLabel = 'All',
}: {
	label?: React.ReactNode;
	description?: string;
	placeholder?: string;
	noneLabel?: string;
}) {
	const field = useFieldContext<ContentType>();
	const form = useFormContext();
	const [open, setOpen] = React.useState(false);
	const value = Number(field.state.value ?? 0);

	const options = React.useMemo(() => {
		const toLabel = (enumName: string) => {
			const cleaned = enumName
				.replace(/^CONTENT_TYPE_/, '')
				.replace(/^CONTENT_/, '')
				.replace(/^ContentType/, '')
				.replace(/^Content/, '')
				.replace(/_/g, ' ')
				.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
				.trim();
			if (!cleaned) return enumName;
			return cleaned
				.toLowerCase()
				.replace(/\b\w/g, (c) => c.toUpperCase());
		};

		return Object.entries(ContentType)
			.filter(
				([k, v]) => Number.isNaN(Number(k)) && typeof v === 'number',
			)
			.map(([name, enumValue]) => {
				const label = toLabel(name);
				return { value: Number(enumValue), label };
			})
			.filter((o) => o.value !== 0)
			.sort((a, b) => a.value - b.value);
	}, []);

	const selected = options.find((o) => o.value === value);

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
						{description ? (
							<FieldDescription>{description}</FieldDescription>
						) : null}
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									type='button'
									variant='outline'
									role='combobox'
									aria-expanded={open}
									className='w-full justify-between'
								>
									{value === 0
										? placeholder
										: (selected?.label ?? placeholder)}
									<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
								<Command>
									<CommandInput placeholder='Search content type...' />
									<CommandList>
										<CommandEmpty>
											No content type found.
										</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value='__any__'
												onSelect={() => {
													field.handleChange(
														0 as ContentType,
													);
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														'mr-2 h-4 w-4',
														value === 0
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
												{noneLabel}
											</CommandItem>
											{options.map((opt) => (
												<CommandItem
													key={opt.value}
													value={opt.label}
													onSelect={() => {
														field.handleChange(
															opt.value as ContentType,
														);
														setOpen(false);
													}}
												>
													<CheckIcon
														className={cn(
															'mr-2 h-4 w-4',
															value === opt.value
																? 'opacity-100'
																: 'opacity-0',
														)}
													/>
													{opt.label}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
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
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function ChannelSelectField({
	label,
	options = [],
	placeholder = 'Select channel...',
	noneLabel = 'None',
}: {
	label?: React.ReactNode;
	options?: Array<{ ChannelId?: string; DisplayName?: string }>;
	placeholder?: string;
	noneLabel?: string;
}) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();
	const [open, setOpen] = React.useState(false);

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

				const value = (field.state.value ?? '').trim();
				const selected = options.find(
					(o) => (o.ChannelId ?? '') === value
				);

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									type='button'
									variant='outline'
									role='combobox'
									aria-expanded={open}
									className='w-full justify-between'
								>
									{value
										? selected?.DisplayName ??
										  selected?.ChannelId ??
										  value
										: placeholder}
									<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
								<Command>
									<CommandInput placeholder='Search channel...' />
									<CommandList>
										<CommandEmpty>
											No channel found.
										</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value='__none__'
												onSelect={() => {
													field.handleChange('');
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														'mr-2 h-4 w-4',
														value === ''
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
												{noneLabel}
											</CommandItem>
											{options.map((opt) => (
												<CommandItem
													key={opt.ChannelId ?? ''}
													value={opt.ChannelId ?? ''}
													onSelect={(
														currentValue
													) => {
														field.handleChange(
															currentValue ===
																value
																? ''
																: currentValue
														);
														setOpen(false);
													}}
												>
													<CheckIcon
														className={cn(
															'mr-2 h-4 w-4',
															value ===
																(opt.ChannelId ??
																	'')
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													{opt.DisplayName ??
														opt.ChannelId}
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

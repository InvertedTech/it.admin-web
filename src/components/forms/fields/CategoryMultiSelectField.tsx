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
import { ChevronsUpDownIcon, CheckIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export function CategoryMultiSelectField({
	label,
	options = [],
	placeholder = 'Select categories...',
	loading = false,
}: {
	label?: React.ReactNode;
	options?: Array<{ CategoryId?: string; DisplayName?: string }>;
	placeholder?: string;
	loading?: boolean;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [open, setOpen] = React.useState(false);

	const value = Array.isArray(field.state.value)
		? (field.state.value as string[])
		: [];

	const nameById = React.useMemo(() => {
		const m = new Map<string, string>();
		(options || []).forEach((o) => {
			const id = (o?.CategoryId ?? '').trim();
			if (id) m.set(id, o?.DisplayName ?? id);
		});
		return m;
	}, [options]);

	function add(id: string) {
		const key = (id ?? '').trim();
		if (!key || value.includes(key)) return;
		field.handleChange([...(value as string[]), key]);
	}
	function remove(id: string) {
		const next = value.filter((v) => v !== id);
		field.handleChange(next);
	}

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
									No categories selected
								</div>
							)}
							{value.map((id) => (
								<button
									key={id}
									type='button'
									className='border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs'
									onClick={() => remove(id)}
									aria-label={`Remove ${
										nameById.get(id) ?? id
									}`}
								>
									<span>{nameById.get(id) ?? id}</span>
									<XIcon className='h-3 w-3 opacity-60' />
								</button>
							))}
						</div>

						<div className='mt-2'>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										type='button'
										variant='outline'
										role='combobox'
										aria-expanded={open}
										className='w-full justify-between'
										disabled={loading}
									>
										{loading ? 'Loading…' : placeholder}
										<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
									{loading ? (
										<div className='text-muted-foreground p-3 text-sm'>
											Loading…
										</div>
									) : (
										<Command>
											<CommandInput placeholder='Search categories...' />
											<CommandList>
												<CommandEmpty>
													No categories found.
												</CommandEmpty>
												<CommandGroup>
													{options.map((opt) => {
														const id =
															opt?.CategoryId ??
															'';
														const selected =
															value.includes(id);
														return (
															<CommandItem
																key={id}
																value={id}
																onSelect={(
																	current
																) => {
																	const nextId =
																		current;
																	if (
																		value.includes(
																			nextId
																		)
																	)
																		remove(
																			nextId
																		);
																	else
																		add(
																			nextId
																		);
																}}
															>
																<CheckIcon
																	className={cn(
																		'mr-2 h-4 w-4',
																		selected
																			? 'opacity-100'
																			: 'opacity-0'
																	)}
																/>
																{opt?.DisplayName ??
																	id}
															</CommandItem>
														);
													})}
												</CommandGroup>
											</CommandList>
										</Command>
									)}
								</PopoverContent>
							</Popover>
						</div>

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

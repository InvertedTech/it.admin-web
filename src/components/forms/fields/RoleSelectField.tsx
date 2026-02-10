'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldError,
	FieldLabel,
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
import { Badge } from '@/components/ui/badge';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

export type RoleSelectOption = {
	DisplayName: string;
	RoleValue: string;
};

export function RoleSelectField({
	label,
	options = [],
	placeholder = 'Select roles...',
	loading = false,
}: {
	label?: React.ReactNode;
	options?: RoleSelectOption[];
	placeholder?: string;
	loading?: boolean;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [open, setOpen] = React.useState(false);
	const value = Array.isArray(field.state.value)
		? (field.state.value as string[])
		: [];

	const labelByValue = React.useMemo(() => {
		const m = new Map<string, string>();
		(options || []).forEach((opt) => {
			const key = (opt?.RoleValue ?? '').trim();
			if (key) m.set(key, opt?.DisplayName ?? key);
		});
		return m;
	}, [options]);

	function add(roleValue: string) {
		const key = (roleValue ?? '').trim();
		if (!key || value.includes(key)) return;
		field.handleChange([...(value as string[]), key]);
	}

	function remove(roleValue: string) {
		const next = value.filter((r) => r !== roleValue);
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

						<div className='border-input bg-background/50 mt-1 min-h-10 rounded-md border px-2 py-1.5'>
							{value.length === 0 ? (
								<div className='text-muted-foreground text-sm'>
									No roles selected
								</div>
							) : (
								<div className='flex flex-wrap items-center gap-1.5'>
									{value.map((id) => (
										<Badge
											key={id}
											variant='secondary'
											className='gap-1 pr-1'
										>
											<span>{labelByValue.get(id) ?? id}</span>
											<button
												type='button'
												className='hover:bg-foreground/10 inline-flex h-4 w-4 items-center justify-center rounded-sm'
												onClick={() => remove(id)}
												aria-label={`Remove ${
													labelByValue.get(id) ?? id
												}`}
											>
												<XIcon className='h-3 w-3' />
											</button>
										</Badge>
									))}
								</div>
							)}
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
										{loading ? 'Loading...' : placeholder}
										<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
									{loading ? (
										<div className='text-muted-foreground p-3 text-sm'>
											Loading...
										</div>
									) : (
										<Command>
											<CommandInput placeholder='Search roles...' />
											<CommandList>
												<CommandEmpty>
													No roles found.
												</CommandEmpty>
												<CommandGroup>
													{options.map((opt) => {
														const id =
															opt?.RoleValue ?? '';
														const selected =
															value.includes(id);
														return (
															<CommandItem
																key={id}
																value={`${id} ${opt?.DisplayName ?? ''}`.trim()}
																onSelect={() => {
																	if (
																		value.includes(
																			id,
																		)
																	)
																		remove(
																			id,
																		);
																	else
																		add(id);
																}}
															>
																<CheckIcon
																	className={cn(
																		'mr-2 h-4 w-4',
																		selected
																			? 'opacity-100'
																			: 'opacity-0',
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

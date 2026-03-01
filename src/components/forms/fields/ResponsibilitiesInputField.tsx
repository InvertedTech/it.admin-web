'use client';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import { Card, CardContent } from '@/components/ui/card';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemSeparator,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { InputGroup, InputGroupButton } from '@/components/ui/input-group';
type FieldProps = {
	label?: string;
};

function ResponsibilitiesList({
	vals,
	onDelete,
	onAdd,
}: {
	vals: string[];
	onDelete: (idx: number) => void;
	onAdd: (val: string) => void;
}) {
	const [input, setInput] = useState('');

	return (
		<Card>
			<CardContent className='p-0'>
				<ItemGroup>
					{vals.map((val, idx) => (
						<>
							{idx > 0 && <ItemSeparator key={`sep-${idx}`} />}
							<Item key={idx} size='sm'>
								<ItemContent className='text-sm'>
									{val}
								</ItemContent>
								<ItemActions>
									<Button
										variant='ghost'
										size='icon-sm'
										className='text-muted-foreground hover:text-destructive'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onDelete(idx);
										}}
									>
										<Trash2 className='size-4' />
									</Button>
								</ItemActions>
							</Item>
						</>
					))}
				</ItemGroup>
				{vals.length > 0 && <ItemSeparator />}
				<div className='px-3 py-2'>
					<InputGroup>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && input.trim()) {
									e.preventDefault();
									onAdd(input.trim());
									setInput('');
								}
							}}
							placeholder='Add responsibility…'
							className='border-0 shadow-none focus-visible:ring-0 bg-transparent'
						/>
						<InputGroupButton
							type='button'
							onClick={(e) => {
								if (input.trim()) {
									e.preventDefault();
									e.stopPropagation();
									onAdd(input.trim());
									setInput('');
								}
							}}
						>
							<Plus className='size-4' />
						</InputGroupButton>
					</InputGroup>
				</div>
			</CardContent>
		</Card>
	);
}

export function ResponsibilitiesInputField({
	label = 'Responsibilities',
}: FieldProps) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();

	const removeValue = (idx: number) => {
		if (!field.state.value) return;
		const next = [...field.state.value];
		next.splice(idx, 1);
		field.handleChange(next);
	};

	const addValue = (val: string) => {
		field.pushValue(val);
	};

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
						{label && (
							<FieldLabel htmlFor={field.name}>
								{label}
							</FieldLabel>
						)}
						<ResponsibilitiesList
							vals={field.state.value ?? []}
							onDelete={removeValue}
							onAdd={addValue}
						/>
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

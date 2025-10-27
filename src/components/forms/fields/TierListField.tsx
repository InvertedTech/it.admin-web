'use client';
import React from 'react';
import { useFieldContext } from '@/hooks/form-context';
import { Field as UIField, FieldLabel } from '@/components/ui/field';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { centsToCurrency } from './utils';

type Tier = {
	Name: string;
	Description: string;
	Color: string;
	AmountCents: number;
};

const defaultTier: Tier = {
	Name: '',
	Description: '',
	Color: '#7c3aed',
	AmountCents: 0,
};

export function TierListField({
	label = 'Subscription Tiers',
	description = 'Define tiers, colors, and pricing.',
}: {
	label?: string;
	description?: string;
}) {
	const field = useFieldContext<Tier[] | undefined>();
	const tiers = field.state.value ?? [];

	function update(idx: number, patch: Partial<Tier>) {
		const copy = [...tiers];
		copy[idx] = { ...copy[idx], ...patch };
		field.handleChange(copy);
	}
	function remove(idx: number) {
		const copy = [...tiers];
		copy.splice(idx, 1);
		field.handleChange(copy);
	}
	function add() {
		field.handleChange([...(tiers as Tier[]), { ...defaultTier }]);
	}

	return (
		<UIField>
			<FieldLabel>{label}</FieldLabel>
			<div className='flex justify-end mb-3'>
				<Button type='button' variant='outline' size='sm' onClick={add}>
					Add Tier
				</Button>
			</div>

			{tiers.length === 0 ? (
				<div className='rounded-md border p-4 text-sm text-muted-foreground'>
					No tiers yet. Click <b>Add Tier</b> to begin.
				</div>
			) : (
				<Accordion type='multiple' className='w-full space-y-3'>
					{tiers.map((t, i) => (
						<AccordionItem
							key={i}
							value={`tier-${i}`}
							className='rounded-lg border'
						>
							<AccordionTrigger className='group flex w-full items-center justify-between px-3 py-3 hover:no-underline'>
								<div className='flex items-center gap-3'>
									<span
										className='h-3 w-3 rounded-full border'
										style={{ backgroundColor: t.Color }}
									/>
									<span className='font-medium'>
										{t.Name || `Tier ${i + 1}`}{' '}
										<span className='text-muted-foreground font-normal'>
											·{' '}
											{centsToCurrency(
												t.AmountCents || 0
											)}
										</span>
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className='px-3 pb-4'>
								<div className='mb-3 flex justify-end'>
									<Button
										type='button'
										variant='destructive'
										size='sm'
										onClick={() => remove(i)}
									>
										Delete tier
									</Button>
								</div>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
									<div className='grid gap-2'>
										<Label>Name</Label>
										<Input
											value={t.Name}
											onChange={(e) =>
												update(i, {
													Name: e.target.value,
												})
											}
											placeholder='Pro, Free, etc.'
										/>
									</div>
									<div className='grid gap-2'>
										<Label>Amount (cents)</Label>
										<div className='relative'>
											<Input
												type='number'
												value={String(
													t.AmountCents ?? 0
												)}
												onChange={(e) =>
													update(i, {
														AmountCents: Number(
															e.target.value
														),
													})
												}
												className='pr-20'
											/>
											<span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
												≈{' '}
												{centsToCurrency(
													t.AmountCents || 0
												)}
												/mo
											</span>
										</div>
									</div>
									<div className='grid gap-2'>
										<Label>Color</Label>
										<div className='flex items-center gap-2'>
											<Input
												type='color'
												className='h-9 w-12 p-1'
												value={t.Color}
												onChange={(e) =>
													update(i, {
														Color: e.target.value,
													})
												}
											/>
											<Input
												value={t.Color}
												onChange={(e) =>
													update(i, {
														Color: e.target.value,
													})
												}
											/>
										</div>
									</div>
								</div>
								<div className='mt-4 grid gap-2'>
									<Label>Description</Label>
									<textarea
										rows={3}
										className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										value={t.Description ?? ''}
										onChange={(e) =>
											update(i, {
												Description: e.target.value,
											})
										}
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</UIField>
	);
}

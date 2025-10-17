'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export type Tier = {
	Name: string;
	Description: string;
	Color: string; // hex or any CSS color
	AmountCents: number; // integer >= 0
};

export type TierConfig = {
	Tiers: Tier[];
};

export const defaultTier: Tier = {
	Name: '',
	Description: '',
	Color: '#7c3aed', // purple
	AmountCents: 0,
};

// --- Zod Schemas (no invalid_type_error option) ---
const TierSchema = z.object({
	Name: z.string().min(1, 'Required'),
	Description: z.string().optional().default(''),
	Color: z.string().min(1, 'Required'),
	AmountCents: z
		.number()
		.refine((v) => Number.isInteger(v), { message: 'Must be an integer' })
		.min(0, { message: 'Must be ≥ 0' }),
});
const TiersSchema = z.object({
	Tiers: z.array(TierSchema).min(1, 'Add at least one tier'),
});

// --- Utilities ---
function centsToCurrency(cents: number) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
		}).format(cents / 100);
	} catch {
		return `$ ${(cents / 100).toFixed(2)}`;
	}
}

// --- Form Component ---
export function TiersForm({
	initial,
	onSave,
	title = 'Subscription Tiers',
	description = 'Define membership tiers, colors, and pricing.',
}: {
	initial: TierConfig;
	onSave?: (value: TierConfig) => Promise<unknown> | unknown;
	title?: string;
	description?: string;
}) {
	const form = useForm({
		defaultValues: initial,
		onSubmit: async ({ value }) => {
			const parsed = TiersSchema.safeParse(value);
			if (!parsed.success) {
				toast.error('Please fix validation errors before saving.');
				return;
			}
			const action = onSave ?? (async () => {});
			await toast.promise(Promise.resolve(action(parsed.data)), {
				loading: 'Saving tiers…',
				success: 'Tiers saved',
				error: 'Failed to save tiers',
			});
		},
	});

	const addTier = () => {
		const list = form.state.values.Tiers;
		form.setFieldValue('Tiers', [...list, { ...defaultTier }]);
	};
	const removeTier = (idx: number) => {
		const next = [...form.state.values.Tiers];
		next.splice(idx, 1);
		form.setFieldValue('Tiers', next);
	};

	return (
		<Card className='overflow-hidden'>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='flex justify-end'>
					<Button
						type='button'
						onClick={addTier}
						variant='outline'
						size='sm'
					>
						Add Tier
					</Button>
				</div>

				<form.Field name='Tiers'>
					{(field: any) => (
						<div className='space-y-6'>
							{field.state.value.map((_: Tier, idx: number) => (
								<TierRow
									key={idx}
									index={idx}
									onRemove={() => removeTier(idx)}
									form={form}
								/>
							))}
							{field.state.value.length === 0 && (
								<div className='rounded-md border p-6 text-sm text-muted-foreground'>
									No tiers yet. Click <b>Add Tier</b> to get
									started.
								</div>
							)}
						</div>
					)}
				</form.Field>

				<Separator />

				<div className='flex items-center gap-2'>
					<Button onClick={() => form.handleSubmit()}>Save</Button>
					<Badge variant='secondary' className='ml-auto'>
						{form.state.values.Tiers.length} tier(s)
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}

// Keep the form prop lightly typed to avoid the “Expected 12 type arguments” error.
function TierRow({
	index,
	onRemove,
	form,
}: {
	index: number;
	onRemove: () => void;
	form: any;
}) {
	const namePath = `Tiers.${index}.Name` as const;
	const descPath = `Tiers.${index}.Description` as const;
	const colorPath = `Tiers.${index}.Color` as const;
	const amountPath = `Tiers.${index}.AmountCents` as const;

	const amount = Number(form.getFieldValue(amountPath) ?? 0);

	return (
		<div className='rounded-lg border p-4'>
			<div className='mb-3 flex items-center justify-between'>
				<Badge variant='outline'>Tier {index + 1}</Badge>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className='text-muted-foreground'
					onClick={onRemove}
					aria-label='Remove tier'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
				{/* Name */}
				<form.Field name={namePath}>
					{(field: any) => (
						<div className='grid gap-2'>
							<Label htmlFor={`${namePath}`}>Name</Label>
							<Input
								id={`${namePath}`}
								value={field.state.value ?? ''}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => field.handleChange(e.target.value)}
								placeholder='e.g., Free, Member, Pro'
							/>
							{field.state.meta.errors?.length ? (
								<p className='text-destructive text-xs'>
									{field.state.meta.errors.join(', ')}
								</p>
							) : null}
						</div>
					)}
				</form.Field>

				{/* Amount (cents) */}
				<form.Field name={amountPath}>
					{(field: any) => (
						<div className='grid gap-2'>
							<Label htmlFor={`${amountPath}`}>
								Amount (cents)
							</Label>
							<Input
								id={`${amountPath}`}
								type='number'
								inputMode='numeric'
								min={0}
								step={100}
								value={String(field.state.value ?? 0)}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => field.handleChange(Number(e.target.value))}
							/>
							<p className='text-muted-foreground text-xs'>
								{Number.isFinite(amount)
									? `≈ ${centsToCurrency(amount)}/mo`
									: '—'}
							</p>
						</div>
					)}
				</form.Field>

				{/* Color */}
				<form.Field name={colorPath}>
					{(field: any) => (
						<div className='grid gap-2'>
							<Label htmlFor={`${colorPath}`}>Color</Label>
							<div className='flex items-center gap-2'>
								<Input
									id={`${colorPath}`}
									type='color'
									className='h-9 w-12 p-1'
									value={field.state.value || '#7c3aed'}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => field.handleChange(e.target.value)}
								/>
								<Input
									value={field.state.value || '#7c3aed'}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => field.handleChange(e.target.value)}
									placeholder='#7c3aed'
								/>
							</div>
						</div>
					)}
				</form.Field>
			</div>

			{/* Description (no shadcn Textarea; styled native) */}
			<div className='mt-4'>
				<form.Field name={descPath}>
					{(field: any) => (
						<div className='grid gap-2'>
							<Label htmlFor={`${descPath}`}>Description</Label>
							<textarea
								id={`${descPath}`}
								rows={3}
								className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
								value={field.state.value ?? ''}
								onChange={(
									e: React.ChangeEvent<HTMLTextAreaElement>
								) => field.handleChange(e.target.value)}
								placeholder='What’s included at this level?'
							/>
						</div>
					)}
				</form.Field>
			</div>
		</div>
	);
}

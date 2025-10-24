'use client';

import React, { useEffect, useState } from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useStore } from '@tanstack/react-form';
// Attempt to resolve submit-time field errors for a given absolute field name
function matchFieldErrors(
	fields: Record<string, string | string[]> | undefined,
	fieldName: string
): string[] | undefined {
	if (!fields) return undefined;
	const abs = fieldName;
	const last = abs.split('.').pop() || abs;
	const camel = last ? last.charAt(0).toLowerCase() + last.slice(1) : last;
	let msgs: any =
		(fields as any)[abs] ?? (fields as any)[last] ?? (fields as any)[camel];
	if (!msgs) {
		const keys = Object.keys(fields);
		const lower = last.toLowerCase();
		const key = keys.find(
			(k) =>
				k.toLowerCase() === lower ||
				k.toLowerCase().endsWith('.' + lower)
		);
		if (key) msgs = (fields as any)[key];
	}
	if (!msgs) return undefined;
	return Array.isArray(msgs) ? msgs : [msgs];
}

// We will subscribe to the parent form via form.Subscribe in each field

export function TextField({
	label,
	description,
	disabled,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
}) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

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
				const combined = [
					...(Array.isArray(field.state.meta.errors)
						? (field.state.meta.errors as any)
						: []),
					...submitField,
					...syncField,
				];
				const errors = normalizeFieldErrors(combined as any) ?? [];
				const isInvalid = errors.length > 0;
				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Input
							id={field.name}
							name={field.name}
							value={(field.state.value ?? '') as string}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={isInvalid}
							autoComplete='off'
							disabled={disabled}
						/>
						{description && (
							<FieldDescription>{description}</FieldDescription>
						)}
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

export function SwitchField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<boolean | undefined>();
	const form = useFormContext();
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
				const combined = [
					...(Array.isArray(field.state.meta.errors)
						? (field.state.meta.errors as any)
						: []),
					...submitField,
					...syncField,
				];
				const errors = normalizeFieldErrors(combined as any) ?? [];
				const isInvalid = errors.length > 0;
				return (
					<UIField data-invalid={isInvalid} orientation='responsive'>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Switch
							id={field.name}
							name={field.name}
							checked={!!field.state.value}
							onCheckedChange={(v) => field.handleChange(!!v)}
							aria-invalid={isInvalid}
							className='w-auto'
						/>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

export function BooleanField({
	label,
	onLabel = 'Enabled',
	offLabel = 'Disabled',
}: {
	label?: React.ReactNode;
	onLabel?: React.ReactNode;
	offLabel?: React.ReactNode;
}) {
	const field = useFieldContext<boolean | undefined>();
	const value = !!field.state.value;
	const form = useFormContext();
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
				const combined = [
					...(Array.isArray(field.state.meta.errors)
						? (field.state.meta.errors as any)
						: []),
					...submitField,
					...syncField,
				];
				const errors = normalizeFieldErrors(combined as any) ?? [];
				const isInvalid = errors.length > 0;
				return (
					<UIField data-invalid={isInvalid} orientation='responsive'>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<ToggleGroup
							type='single'
							value={value ? 'on' : 'off'}
							onValueChange={(v) => {
								if (!v) return;
								field.handleChange(v === 'on');
							}}
							className='w-fit'
							variant='outline'
							size='lg'
						>
							<ToggleGroupItem value='on'>
								{onLabel}
							</ToggleGroupItem>
							<ToggleGroupItem value='off'>
								{offLabel}
							</ToggleGroupItem>
						</ToggleGroup>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

export function SubmitErrors() {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
			{(errs: any) => <FormSubmitErrors errors={errs} />}
		</form.Subscribe>
	);
}

export function TextAreaField({
	label,
	description,
	disabled,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
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
	const combined = [
		...(Array.isArray(field.state.meta.errors)
			? (field.state.meta.errors as any)
			: []),
		...submitField,
		...syncField,
	];
	const errors = normalizeFieldErrors(combined as any) ?? [];
	const isInvalid = errors.length > 0;
	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				value={(field.state.value ?? '') as string}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				disabled={disabled}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={errors} />}
		</UIField>
	);
}

export function PasswordField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const [show, setShow] = useState(false);

	const form = useFormContext();
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
				const combined = [
					...(Array.isArray(field.state.meta.errors)
						? (field.state.meta.errors as any)
						: []),
					...submitField,
					...syncField,
				];
				const errors = normalizeFieldErrors(combined as any) ?? [];
				const isInvalid = errors.length > 0;
				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<div className='relative'>
							<Input
								id={field.name}
								name={field.name}
								type={show ? 'text' : 'password'}
								autoComplete={show ? 'off' : 'current-password'}
								placeholder={show ? '' : '••••••••'}
								value={(field.state.value ?? '') as string}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(e.target.value)
								}
								aria-invalid={isInvalid}
							/>
							<button
								type='button'
								aria-label={
									show ? 'Hide password' : 'Show password'
								}
								className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded p-1'
								onClick={() => setShow((v) => !v)}
							>
								{show ? (
									<EyeOffIcon className='h-4 w-4' />
								) : (
									<EyeIcon className='h-4 w-4' />
								)}
							</button>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

// Client-side helper to fetch subscription tiers from our API route
async function fetchTiers(): Promise<
	Array<{ Name?: string; AmountCents?: number }>
> {
	try {
		const res = await fetch('/api/settings/tiers', { cache: 'no-store' });
		if (!res?.ok) return [];
		const json = await res.json();
		return Array.isArray(json?.Tiers) ? json.Tiers : [];
	} catch {
		return [];
	}
}

export function SubscriptionTierField({
	label,
	tiers: initialTiers,
}: {
	label?: React.ReactNode;
	tiers?: Array<{ Name?: string; AmountCents?: number }>;
}) {
	const field = useFieldContext<number | undefined>();
	const [tiers, setTiers] = React.useState(initialTiers);

	React.useEffect(() => {
		if (initialTiers && initialTiers.length) return;
		let mounted = true;
		fetchTiers().then((t) => {
			if (mounted) setTiers(t);
		});
		return () => {
			mounted = false;
		};
	}, [initialTiers]);

	const value = String(field.state.value ?? 0);
	const options = React.useMemo(() => {
		const list = [{ value: '0', label: 'Free' }];
		if (Array.isArray(tiers)) {
			tiers.forEach((t, i) => {
				const level = i + 1; // levels start at 1 for configured tiers
				list.push({
					value: String(level),
					label: t?.Name || `Tier ${level}`,
				});
			});
		}
		return list;
	}, [tiers]);

	return (
		<UIField>
			<FieldLabel htmlFor={field.name}>
				{label ?? 'Subscription Tier'}
			</FieldLabel>
			<Select
				value={value}
				onValueChange={(v) => field.handleChange(Number(v))}
			>
				<SelectTrigger id={field.name} className='w-full'>
					<SelectValue placeholder='Select tier' />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</UIField>
	);
}

'use client';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'isomorphic-dompurify';
import remarkGfm from 'remark-gfm';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
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
import {
	ChevronsUpDownIcon,
	CheckIcon,
	XIcon,
	CalendarIcon,
	Power,
	PowerOff,
	Youtube,
	Rss,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { parseDate } from 'chrono-node';
import type {
	ChannelRecord,
	CategoryRecord,
} from '@inverted-tech/fragments/Settings';
import { cn } from '@/lib/utils';
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
import { useStore } from '@tanstack/react-form'; // --- Subscription Tier List Editor (reusable field) ---
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CmsBodyTextarea } from '../ui/CMSTextArea';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
} from '@/components/ui/input-group';
import { Toggle } from '@/components/ui/toggle';

import {
	Eye,
	Bold,
	Italic,
	Link as LinkIcon,
	Heading3,
	List,
	Quote,
	Code,
} from 'lucide-react';
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from '../ui/menubar';
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
		field.handleChange([...tiers, { ...defaultTier }]);
	}

	return (
		<UIField>
			<FieldLabel>{label}</FieldLabel>
			<div className="flex justify-end mb-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
				>
					Add Tier
				</Button>
			</div>
			{tiers.length === 0 ? (
				<div className="rounded-md border p-4 text-sm text-muted-foreground">
					No tiers yet. Click <b>Add Tier</b> to begin.
				</div>
			) : (
				<Accordion
					type="multiple"
					className="w-full space-y-3"
				>
					{tiers.map((t, i) => (
						<AccordionItem
							key={i}
							value={`tier-${i}`}
							className="rounded-lg border"
						>
							<AccordionTrigger className="group flex w-full items-center justify-between px-3 py-3 hover:no-underline">
								<div className="flex items-center gap-3">
									<span
										className="h-3 w-3 rounded-full border"
										style={{ backgroundColor: t.Color }}
									/>
									<span className="font-medium">
										{t.Name || `Tier ${i + 1}`}{' '}
										<span className="text-muted-foreground font-normal">
											· {centsToCurrency(t.AmountCents || 0)}
										</span>
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-3 pb-4">
								<div className="mb-3 flex justify-end">
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => remove(i)}
									>
										Delete tier
									</Button>
								</div>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="grid gap-2">
										<Label>Name</Label>
										<Input
											value={t.Name}
											onChange={(e) => update(i, { Name: e.target.value })}
											placeholder="Pro, Free, etc."
										/>
									</div>
									<div className="grid gap-2">
										<Label>Amount (cents)</Label>
										<div className="relative">
											<Input
												type="number"
												value={String(t.AmountCents ?? 0)}
												onChange={(e) =>
													update(i, { AmountCents: Number(e.target.value) })
												}
												className="pr-20"
											/>
											<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
												≈ {centsToCurrency(t.AmountCents || 0)}/mo
											</span>
										</div>
									</div>
									<div className="grid gap-2">
										<Label>Color</Label>
										<div className="flex items-center gap-2">
											<Input
												type="color"
												className="h-9 w-12 p-1"
												value={t.Color}
												onChange={(e) => update(i, { Color: e.target.value })}
											/>
											<Input
												value={t.Color}
												onChange={(e) => update(i, { Color: e.target.value })}
											/>
										</div>
									</div>
								</div>
								<div className="mt-4 grid gap-2">
									<Label>Description</Label>
									<textarea
										rows={3}
										className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										value={t.Description ?? ''}
										onChange={(e) => update(i, { Description: e.target.value })}
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
			(k) => k.toLowerCase() === lower || k.toLowerCase().endsWith('.' + lower)
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
						<Input
							id={field.name}
							name={field.name}
							value={(field.state.value ?? '') as string}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={isInvalid}
							autoComplete="off"
							disabled={disabled}
						/>
						{description && <FieldDescription>{description}</FieldDescription>}
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
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
				const checked = !!field.state.value;

				return (
					<UIField
						data-invalid={isInvalid}
						orientation="responsive"
					>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

						<InputGroup className="w-fit">
							{/* Track: fixed size, inner padding to house knob */}
							<button
								id={field.name}
								name={field.name}
								type="button"
								role="switch"
								aria-checked={checked}
								aria-invalid={isInvalid}
								data-slot="input-group-control"
								onClick={() => field.handleChange(!checked)}
								className={cn(
									'relative h-9 w-20 rounded-full border p-1 outline-none transition-colors',
									checked
										? 'bg-emerald-500 border-emerald-500'
										: 'bg-muted border-border'
								)}
							>
								{/* Knob */}
								<span
									className={cn(
										'absolute top-1 left-1 h-7 w-7 rounded-full bg-background shadow-sm',
										'grid place-items-center transition-transform duration-200 will-change-transform',
										checked && 'translate-x-11' // 44px = 80 - 28 - 8
									)}
								>
									{checked ? (
										<Power className="h-4 w-4 text-emerald-600" />
									) : (
										<PowerOff className="h-4 w-4 text-muted-foreground" />
									)}
								</span>
							</button>

							{/* Fixed-width status chip to prevent layout shift */}
							<InputGroupAddon align="inline-end">
								<Badge
									variant={checked ? 'default' : 'secondary'}
									className={cn(
										'h-6 w-12 justify-center px-0 text-xs font-medium',
										checked
											? 'bg-emerald-600 text-white hover:bg-emerald-600'
											: ''
									)}
								>
									{checked ? 'On' : 'Off'}
								</Badge>
							</InputGroupAddon>
						</InputGroup>

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
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
				const value = !!field.state.value;

				return (
					<UIField
						data-invalid={isInvalid}
						orientation="responsive"
					>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

						<ToggleGroup
							type="single"
							value={value ? 'on' : 'off'}
							onValueChange={(v) => v && field.handleChange(v === 'on')}
							className="w-fit"
							variant="outline"
							size="lg"
						>
							<ToggleGroupItem
								value="on"
								className={cn(
									'flex items-center gap-2 px-3 transition-colors',
									'data-[state=on]:bg-emerald-500 data-[state=on]:text-white',
									'data-[state=on]:hover:bg-emerald-600'
								)}
							>
								<Power className="h-4 w-4" />
								<span className="text-sm font-medium">{onLabel}</span>
							</ToggleGroupItem>
							<ToggleGroupItem
								value="off"
								className={cn(
									'flex items-center gap-2 px-3 transition-colors',
									'data-[state=on]:bg-muted data-[state=on]:text-muted-foreground',
									'data-[state=on]:hover:bg-muted/80'
								)}
							>
								<PowerOff className="h-4 w-4" />
								<span className="text-sm font-medium">{offLabel}</span>
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
						<div className="relative">
							<Input
								id={field.name}
								name={field.name}
								type={show ? 'text' : 'password'}
								autoComplete={show ? 'off' : 'current-password'}
								placeholder={show ? '' : '••••••••'}
								value={(field.state.value ?? '') as string}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							<button
								type="button"
								aria-label={show ? 'Hide password' : 'Show password'}
								className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded p-1"
								onClick={() => setShow((v) => !v)}
							>
								{show ? (
									<EyeOffIcon className="h-4 w-4" />
								) : (
									<EyeIcon className="h-4 w-4" />
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
				<SelectTrigger
					id={field.name}
					className="w-full"
				>
					<SelectValue placeholder="Select tier" />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem
							key={opt.value}
							value={opt.value}
						>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</UIField>
	);
}

// Image Picker Field
type ImageRecord = {
	AssetID?: string;
	Title?: string;
	URL?: string;
	Width?: number;
	Height?: number;
	Public?: { Data?: { URL?: string; MimeType?: string; Data?: string } };
	Data?: { URL?: string; MimeType?: string; Data?: string };
};

function srcFromImageRecord(r: ImageRecord): string | null {
	const direct = r?.URL || r?.Public?.Data?.URL || r?.Data?.URL;
	if (direct) return direct;
	const base64 = r?.Public?.Data?.Data || r?.Data?.Data;
	const mime = r?.Public?.Data?.MimeType || r?.Data?.MimeType || 'image/png';
	if (base64) return `data:${mime};base64,${base64}`;
	if (r?.AssetID)
		return `http://localhost:8081/api/cms/asset/image/${r.AssetID}/data`;
	return null;
}

export function ImagePickerField({ label = 'Image' }: { label?: string }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	const [open, setOpen] = useState(false);
	const [images, setImages] = useState<ImageRecord[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || images.length) return;
		setLoading(true);
		fetch('/api/assets/images')
			.then((r) => r.json())
			.then((j) => setImages((j?.Records as ImageRecord[]) ?? []))
			.finally(() => setLoading(false));
	}, [open, images.length]);

	const selected = useMemo(
		() => images.find((i) => i.AssetID === field.state.value),
		[images, field.state.value]
	);
	const directSrc = selected ? srcFromImageRecord(selected) : undefined;
	const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

	useEffect(() => {
		setFallbackSrc(null);
		const id = field.state.value;
		if (!id || directSrc) return;
		fetch(`/api/assets/${id}`)
			.then((r) => r.json())
			.then((admin) => {
				const rec = admin?.Record ?? admin?.record ?? admin;
				const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
				let dataObj: any = null;
				if (one?.case === 'Image' || one?.case === 'image') {
					const pub = (one?.value?.Public ??
						one?.value?.public ??
						one?.value) as any;
					dataObj = pub?.Data ?? pub?.data ?? {};
				} else if (rec?.Image || rec?.image) {
					const imageRec = rec?.Image ?? rec?.image;
					const pub = imageRec?.Public ?? imageRec?.public ?? imageRec;
					dataObj = pub?.Data ?? pub?.data ?? {};
				}
				const base64 = dataObj?.Data ?? dataObj?.data;
				const mime = dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
				if (typeof base64 === 'string' && base64.length > 0) {
					setFallbackSrc(`data:${mime};base64,${base64}`);
				}
			})
			.catch(() => {});
	}, [field.state.value, directSrc]);

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
						<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 overflow-hidden rounded border bg-muted">
								{directSrc || fallbackSrc ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={(directSrc ?? fallbackSrc) as string}
										alt={selected?.Title ?? 'Selected'}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
										—
									</div>
								)}
							</div>
							<div className="text-sm">
								{field.state.value ?? 'No image selected'}
							</div>
							<Dialog
								open={open}
								onOpenChange={setOpen}
							>
								<DialogTrigger asChild>
									<Button
										type="button"
										variant="outline"
										className="ml-auto"
									>
										Browse
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-4xl">
									<DialogTitle>Select Image</DialogTitle>
									{loading ? (
										<div className="text-muted-foreground text-sm">
											Loading…
										</div>
									) : (
										<div className="grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
											{images.map((img) => (
												<ImageTile
													key={img.AssetID ?? Math.random()}
													img={img}
													onSelect={(id) => {
														field.handleChange(id);
														setOpen(false);
													}}
												/>
											))}
										</div>
									)}
								</DialogContent>
							</Dialog>
							{field.state.value && (
								<Button
									type="button"
									variant="ghost"
									onClick={() => field.handleChange('')}
								>
									Clear
								</Button>
							)}
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

function ImageTile({
	img,
	onSelect,
}: {
	img: ImageRecord;
	onSelect: (id: string) => void;
}) {
	const [src, setSrc] = useState<string | null>(null);
	useEffect(() => {
		const direct = srcFromImageRecord(img);
		if (direct) {
			setSrc(direct);
			return;
		}
		if (img.AssetID) {
			fetch(`/api/assets/${img.AssetID}`)
				.then((r) => r.json())
				.then((admin) => {
					const rec = admin?.Record ?? admin?.record ?? admin;
					const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
					let dataObj: any = null;
					if (one?.case === 'Image' || one?.case === 'image') {
						const pub = (one?.value?.Public ??
							one?.value?.public ??
							one?.value) as any;
						dataObj = pub?.Data ?? pub?.data ?? {};
					} else if (rec?.Image || rec?.image) {
						const imageRec = rec?.Image ?? rec?.image;
						const pub = imageRec?.Public ?? imageRec?.public ?? imageRec;
						dataObj = pub?.Data ?? pub?.data ?? {};
					}
					const b64 = dataObj?.Data ?? dataObj?.data;
					const mime = dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
					if (typeof b64 === 'string' && b64.length > 0) {
						setSrc(`data:${mime};base64,${b64}`);
					} else {
						setSrc(
							`http://localhost:8081/api/cms/asset/image/${img.AssetID}/data`
						);
					}
				})
				.catch(() => setSrc(null));
		}
	}, [img]);

	return (
		<button
			type="button"
			className="focus-visible:ring-ring hover:ring-ring group relative overflow-hidden rounded border outline-none ring-2 ring-transparent"
			onClick={() => img.AssetID && onSelect(img.AssetID)}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{src ? (
				<img
					src={src}
					alt={img.Title ?? ''}
					className="h-28 w-full object-cover sm:h-32"
				/>
			) : (
				<div className="text-muted-foreground flex h-28 w-full items-center justify-center text-xs sm:h-32">
					No preview
				</div>
			)}
			<div className="bg-background/70 text-foreground absolute bottom-0 left-0 right-0 truncate px-2 py-1 text-xs">
				{img.Title ?? img.AssetID}
			</div>
		</button>
	);
}

// Channel selector using Combobox (Popover + Command)
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
	const [open, setOpen] = useState(false);

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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

				const value = (field.state.value ?? '').trim();
				const selected = options.find((o) => (o.ChannelId ?? '') === value);

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<Popover
							open={open}
							onOpenChange={setOpen}
						>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full justify-between"
								>
									{value
										? selected?.DisplayName ?? selected?.ChannelId ?? value
										: placeholder}
									<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
								<Command>
									<CommandInput placeholder="Search channel..." />
									<CommandList>
										<CommandEmpty>No channel found.</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value="__none__"
												onSelect={() => {
													field.handleChange('');
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														'mr-2 h-4 w-4',
														value === '' ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{noneLabel}
											</CommandItem>
											{options.map((opt) => (
												<CommandItem
													key={opt.ChannelId ?? ''}
													value={opt.ChannelId ?? ''}
													onSelect={(currentValue) => {
														field.handleChange(
															currentValue === value ? '' : currentValue
														);
														setOpen(false);
													}}
												>
													<CheckIcon
														className={cn(
															'mr-2 h-4 w-4',
															value === (opt.ChannelId ?? '')
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													{opt.DisplayName ?? opt.ChannelId}
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

// Multi-select field for array of strings (e.g., tags)
export function MultiSelectField({
	label,
	options = [],
	placeholder = 'Add or select...',
}: {
	label?: React.ReactNode;
	options?: string[];
	placeholder?: string;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [input, setInput] = useState('');

	const value = Array.isArray(field.state.value)
		? (field.state.value as string[])
		: [];

	function addItem(tag: string) {
		const t = tag.trim();
		if (!t) return;
		if (value.includes(t)) return;
		field.handleChange([...(value as string[]), t]);
		setInput('');
	}
	function removeItem(tag: string) {
		const next = value.filter((v) => v !== tag);
		field.handleChange(next);
	}

	// Suggested options not already selected
	const available = (options || []).filter((o) => !value.includes(o));

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
						<div className="flex flex-wrap items-center gap-2">
							{value.length === 0 && (
								<div className="text-muted-foreground text-sm">
									No items selected
								</div>
							)}
							{value.map((tag) => (
								<button
									key={tag}
									type="button"
									className="border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
									onClick={() => removeItem(tag)}
									aria-label={`Remove ${tag}`}
								>
									<span>{tag}</span>
									<XIcon className="h-3 w-3 opacity-60" />
								</button>
							))}
						</div>
						<div className="mt-2 flex items-center gap-2">
							<input
								className="border-input bg-background text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 text-sm outline-hidden"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={placeholder}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addItem(input);
									}
								}}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => addItem(input)}
							>
								Add
							</Button>
						</div>
						{available.length > 0 && (
							<div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
								<span>Suggestions:</span>
								{available.map((opt) => (
									<button
										key={opt}
										type="button"
										onClick={() => addItem(opt)}
										className="hover:bg-accent/50 border-input text-foreground rounded border px-2 py-0.5"
									>
										{opt}
									</button>
								))}
							</div>
						)}
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

// Multi-select of channels: stores array of ChannelId strings, displays DisplayName chips
export function ChannelMultiSelectField({
	label,
	options = [],
	placeholder = 'Select channels...',
	loading = false,
}: {
	label?: React.ReactNode;
	options?: Array<Pick<ChannelRecord, 'ChannelId' | 'DisplayName'>>;
	placeholder?: string;
	loading?: boolean;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [open, setOpen] = useState(false);

	const value = Array.isArray(field.state.value)
		? (field.state.value as string[])
		: [];

	const nameById = React.useMemo(() => {
		const m = new Map<string, string>();
		(options || []).forEach((o) => {
			const id = (o?.ChannelId ?? '').trim();
			if (id) m.set(id, o?.DisplayName ?? id);
		});
		return m;
	}, [options]);

	function add(id: string) {
		const key = (id ?? '').trim();
		if (!key) return;
		if (value.includes(key)) return;
		field.handleChange([...(value as string[]), key]);
	}
	function remove(id: string) {
		const next = value.filter((v) => v !== id);
		field.handleChange(next);
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
						<div className="flex flex-wrap items-center gap-2">
							{value.length === 0 && (
								<div className="text-muted-foreground text-sm">
									No channels selected
								</div>
							)}
							{value.map((id) => (
								<button
									key={id}
									type="button"
									className="border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
									onClick={() => remove(id)}
									aria-label={`Remove ${nameById.get(id) ?? id}`}
								>
									<span>{nameById.get(id) ?? id}</span>
									<XIcon className="h-3 w-3 opacity-60" />
								</button>
							))}
						</div>
						<div className="mt-2">
							<Popover
								open={open}
								onOpenChange={setOpen}
							>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-full justify-between"
										disabled={loading}
									>
										{loading ? 'Loading…' : placeholder}
										<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
									{loading ? (
										<div className="text-muted-foreground p-3 text-sm">
											Loading…
										</div>
									) : (
										<Command>
											<CommandInput placeholder="Search channels..." />
											<CommandList>
												<CommandEmpty>No channels found.</CommandEmpty>
												<CommandGroup>
													{options.map((opt) => {
														const id = opt?.ChannelId ?? '';
														const selected = value.includes(id);
														return (
															<CommandItem
																key={id}
																value={id}
																onSelect={(current) => {
																	const nextId = current;
																	if (value.includes(nextId)) remove(nextId);
																	else add(nextId);
																}}
															>
																<CheckIcon
																	className={cn(
																		'mr-2 h-4 w-4',
																		selected ? 'opacity-100' : 'opacity-0'
																	)}
																/>
																{opt?.DisplayName ?? id}
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

// Multi-select of categories: stores array of CategoryId strings, displays DisplayName chips
export function CategoryMultiSelectField({
	label,
	options = [],
	placeholder = 'Select categories...',
	loading = false,
}: {
	label?: React.ReactNode;
	options?: Array<Pick<CategoryRecord, 'CategoryId' | 'DisplayName'>>;
	placeholder?: string;
	loading?: boolean;
}) {
	const field = useFieldContext<string[] | undefined>();
	const form = useFormContext();
	const [open, setOpen] = useState(false);

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
		if (!key) return;
		if (value.includes(key)) return;
		field.handleChange([...(value as string[]), key]);
	}
	function remove(id: string) {
		const next = value.filter((v) => v !== id);
		field.handleChange(next);
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
						<div className="flex flex-wrap items-center gap-2">
							{value.length === 0 && (
								<div className="text-muted-foreground text-sm">
									No categories selected
								</div>
							)}
							{value.map((id) => (
								<button
									key={id}
									type="button"
									className="border-input text-foreground hover:bg-accent/50 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
									onClick={() => remove(id)}
									aria-label={`Remove ${nameById.get(id) ?? id}`}
								>
									<span>{nameById.get(id) ?? id}</span>
									<XIcon className="h-3 w-3 opacity-60" />
								</button>
							))}
						</div>
						<div className="mt-2">
							<Popover
								open={open}
								onOpenChange={setOpen}
							>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-full justify-between"
										disabled={loading}
									>
										{loading ? 'Loading…' : placeholder}
										<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
									{loading ? (
										<div className="text-muted-foreground p-3 text-sm">
											Loading…
										</div>
									) : (
										<Command>
											<CommandInput placeholder="Search categories..." />
											<CommandList>
												<CommandEmpty>No categories found.</CommandEmpty>
												<CommandGroup>
													{options.map((opt) => {
														const id = opt?.CategoryId ?? '';
														const selected = value.includes(id);
														return (
															<CommandItem
																key={id}
																value={id}
																onSelect={(current) => {
																	const nextId = current;
																	if (value.includes(nextId)) remove(nextId);
																	else add(nextId);
																}}
															>
																<CheckIcon
																	className={cn(
																		'mr-2 h-4 w-4',
																		selected ? 'opacity-100' : 'opacity-0'
																	)}
																/>
																{opt?.DisplayName ?? id}
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

// Date/time picker that binds to protobuf Timestamp-like values
export function DateTimeField({
	label,
	placeholder = 'Tomorrow or next week',
}: {
	label?: React.ReactNode;
	placeholder?: string;
}) {
	const field = useFieldContext<any>();
	const form = useFormContext();

	function toDate(v: any): Date | undefined {
		try {
			if (!v) return undefined;
			if (v instanceof Date) return v;
			if (typeof v === 'string') {
				const d = parseDate(v) || new Date(v);
				return d instanceof Date && !Number.isNaN(d.getTime()) ? d : undefined;
			}
			if (typeof v === 'object' && v.seconds != null) {
				const s = Number((v as any).seconds ?? 0);
				const n = Number((v as any).nanos ?? 0);
				const ms = s * 1000 + Math.floor(n / 1_000_000);
				const d = new Date(ms);
				return !Number.isNaN(d.getTime()) ? d : undefined;
			}
			return undefined;
		} catch {
			return undefined;
		}
	}

	function toTimestamp(d?: Date): any {
		if (!d) return undefined;
		const ms = d.getTime();
		const seconds = Math.floor(ms / 1000);
		const nanos = (ms % 1000) * 1_000_000;
		return { seconds, nanos };
	}

	const initial = toDate(field.state.value);
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState<Date | undefined>(initial);
	const [month, setMonth] = useState<Date | undefined>(initial);
	const [text, setText] = useState<string>(() => {
		const d = initial;
		return d
			? d.toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
			  })
			: '';
	});

	function commit(d?: Date) {
		if (!d) return;
		const ts = toTimestamp(d);
		if (ts) field.handleChange(ts);
	}

	function fmtDate(d?: Date) {
		return d
			? d.toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
			  })
			: '';
	}

	function timeValue(d?: Date) {
		if (!d) return '';
		const hh = String(d.getHours()).padStart(2, '0');
		const mm = String(d.getMinutes()).padStart(2, '0');
		return `${hh}:${mm}`;
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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
						<div className="relative flex gap-2">
							<Input
								id={field.name}
								name={field.name}
								value={text}
								placeholder={placeholder}
								className="bg-background pr-10"
								onChange={(e) => {
									const val = e.target.value;
									setText(val);
									const d = parseDate(val) || undefined;
									if (d) {
										setDate(d);
										setMonth(d);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										commit(date);
									}
									if (e.key === 'ArrowDown') {
										setOpen(true);
									}
								}}
							/>
							<Popover
								open={open}
								onOpenChange={setOpen}
							>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
									>
										<CalendarIcon className="size-3.5" />
										<span className="sr-only">Select date</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto overflow-hidden p-0"
									align="end"
								>
									<Calendar
										mode="single"
										selected={date}
										captionLayout="dropdown"
										month={month}
										onMonthChange={setMonth}
										onSelect={(d) => {
											setDate(d ?? undefined);
											if (d) {
												setText(fmtDate(d));
												commit(d);
											}
											setOpen(false);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="mt-2 flex items-center gap-2">
							<Input
								type="time"
								className="w-[9rem]"
								value={timeValue(date)}
								onChange={(e) => {
									const v = e.target.value; // HH:MM
									const [hh, mm] = v
										.split(':')
										.map((x) => parseInt(x || '0', 10));
									const base = date ?? new Date();
									const d = new Date(base);
									d.setHours(
										Number.isFinite(hh) ? hh : 0,
										Number.isFinite(mm) ? mm : 0,
										0,
										0
									);
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							/>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const d = new Date();
										setDate(d);
										setMonth(d);
										setText(fmtDate(d));
										commit(d);
									}}
								>
									Now
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const d = new Date();
										d.setHours(d.getHours() + 1, 0, 0, 0);
										setDate(d);
										setMonth(d);
										setText(fmtDate(d));
										commit(d);
									}}
								>
									+1 hour
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const d = new Date();
										d.setDate(d.getDate() + 1);
										d.setHours(9, 0, 0, 0);
										setDate(d);
										setMonth(d);
										setText(fmtDate(d));
										commit(d);
									}}
								>
									Tomorrow 9:00
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const d = new Date();
										const day = d.getDay(); // 0 Sun..6 Sat
										const delta = (1 - day + 7) % 7 || 7; // next Monday
										d.setDate(d.getDate() + delta);
										d.setHours(9, 0, 0, 0);
										setDate(d);
										setMonth(d);
										setText(fmtDate(d));
										commit(d);
									}}
								>
									Next Mon 9:00
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setDate(undefined);
										setText('');
										field.handleChange(undefined);
									}}
								>
									Clear
								</Button>
							</div>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}
// Money (cents) with non-shifting USD overlay
export function MoneyCentsField({
	label,
	min = 0,
	step = 100,
}: {
	label?: React.ReactNode;
	min?: number;
	step?: number;
}) {
	const field = useFieldContext<number | undefined>();
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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

				const cents = Number(field.state.value ?? 0);
				const usd = new Intl.NumberFormat(undefined, {
					style: 'currency',
					currency: 'USD',
				}).format((Number.isFinite(cents) ? cents : 0) / 100);

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<div className="relative">
							<Input
								id={field.name}
								type="number"
								inputMode="numeric"
								min={min}
								step={step}
								value={String(field.state.value ?? 0)}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								className="pr-24"
							/>
							<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
								≈ {usd}/mo
							</span>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

// Color picker + hex input
export function ColorField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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

				const v = field.state.value || '#7c3aed';

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<div className="flex items-center gap-2">
							<Input
								id={field.name}
								type="color"
								className="h-9 w-12 p-1"
								value={v}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<Input
								value={v}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="#7c3aed"
							/>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

export function CmsBodyField({
	label,
	description,
	disabled,
	placeholder = 'Write your article in Markdown…',
	maxLength,
	rows = 12,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	rows?: number;
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

	const [open, setOpen] = React.useState(false);

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

			<CmsBodyTextarea
				id={field.name}
				label={undefined}
				description={typeof description === 'string' ? description : undefined}
				placeholder={placeholder}
				value={(field.state.value ?? '') as string}
				onChange={(v) => field.handleChange(v)}
				onPreview={() => setOpen(true)}
				maxLength={maxLength}
				disabled={disabled}
				rows={rows}
				error={isInvalid ? errors[0]?.message ?? 'Invalid value' : undefined}
				className="mt-1"
			/>

			{description && (
				<FieldDescription className="mt-1">{description}</FieldDescription>
			)}
			{isInvalid && <FieldError errors={errors} />}

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
					</DialogHeader>
					<div className="prose dark:prose-invert max-h-[70vh] overflow-auto">
						{/* If you don’t use react-markdown, swap this with:
                <pre className="whitespace-pre-wrap">{field.state.value ?? ""}</pre> */}
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{(field.state.value ?? '') as string}
						</ReactMarkdown>
					</div>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

export function HtmlBodyField({
	label,
	description,
	disabled,
	placeholder = 'Write HTML…',
	maxLength,
	rows = 12,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	rows?: number;
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

	const [open, setOpen] = React.useState(false);
	const html = (field.state.value ?? '') as string;
	const safe = React.useMemo(
		() =>
			DOMPurify.sanitize(html, {
				USE_PROFILES: { html: true }, // allow standard HTML only
			}),
		[html]
	);

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

			<CmsBodyTextarea
				id={field.name}
				label={undefined}
				description={typeof description === 'string' ? description : undefined}
				placeholder={placeholder}
				value={html}
				onChange={(v) => field.handleChange(v)}
				onPreview={() => setOpen(true)}
				maxLength={maxLength}
				disabled={disabled}
				rows={rows}
				error={isInvalid ? errors[0]?.message ?? 'Invalid value' : undefined}
				className="mt-1"
			/>

			{description && (
				<FieldDescription className="mt-1">{description}</FieldDescription>
			)}
			{isInvalid && <FieldError errors={errors} />}

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
					</DialogHeader>
					<div className="prose dark:prose-invert max-w-none">
						<div dangerouslySetInnerHTML={{ __html: safe }} />
					</div>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

type Mode = 'markdown' | 'html';

export function RichBodyField({
	label,
	description,
	disabled,
	placeholder = 'Write content…',
	rows = 14,
	mode: initialMode = 'html',
	maxLength, // optional: show `/max`
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

	const combined = [
		...(Array.isArray(field.state.meta.errors)
			? (field.state.meta.errors as any)
			: []),
		...submitField,
		...syncField,
	];
	const errors = normalizeFieldErrors(combined as any) ?? [];
	const isInvalid = errors.length > 0;

	const [open, setOpen] = React.useState(false);
	const [mode, setMode] = React.useState<Mode>(initialMode);
	const taRef = React.useRef<HTMLTextAreaElement | null>(null);

	const value = (field.state.value ?? '') as string;
	const charCount = value.length;

	function replaceSelection(
		before: string,
		after: string = '',
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

	const actions = {
		bold: () => (mode === 'markdown' ? replaceSelection('**', '**') : null),
		italic: () => (mode === 'markdown' ? replaceSelection('_', '_') : null),
		h3: () =>
			mode === 'markdown'
				? replaceSelection('### ', '', (s) => s || 'Heading')
				: null,
		ul: () =>
			mode === 'markdown'
				? replaceSelection('', '', (s) =>
						(s || 'item')
							.split(/\n/)
							.map((l) => `- ${l || 'item'}`)
							.join('\n')
				  )
				: null,
		quote: () =>
			mode === 'markdown'
				? replaceSelection('', '', (s) =>
						(s || 'quote')
							.split(/\n/)
							.map((l) => `> ${l || 'quote'}`)
							.join('\n')
				  )
				: null,
		code: () =>
			mode === 'markdown'
				? replaceSelection('```\n', '\n```', (s) => s || 'code')
				: null,
		link: () =>
			mode === 'markdown'
				? replaceSelection('[', '](https://)', (s) => s || 'link text')
				: null,
		h3_html: () =>
			mode === 'html'
				? replaceSelection('<h3>', '</h3>', (s) => s || 'Heading')
				: null,
		b_html: () =>
			mode === 'html' ? replaceSelection('<strong>', '</strong>') : null,
		i_html: () => (mode === 'html' ? replaceSelection('<em>', '</em>') : null),
		ul_html: () =>
			mode === 'html'
				? replaceSelection('', '', (s) => {
						const lines = (s || 'item').split(/\n/);
						const lis = lines.map((l) => `<li>${l || 'item'}</li>`).join('');
						return `<ul>${lis}</ul>`;
				  })
				: null,
		blockquote_html: () =>
			mode === 'html'
				? replaceSelection('<blockquote>', '</blockquote>', (s) => s || 'quote')
				: null,
		code_html: () =>
			mode === 'html'
				? replaceSelection('<pre><code>', '</code></pre>', (s) => s || 'code')
				: null,
		link_html: () =>
			mode === 'html'
				? replaceSelection(
						'<a href="https://">',
						'</a>',
						(s) => s || 'link text'
				  )
				: null,
	};

	const safeHtml = React.useMemo(
		() =>
			mode === 'html'
				? DOMPurify.sanitize(value, { USE_PROFILES: { html: true } })
				: '',
		[mode, value]
	);

	return (
		<UIField data-invalid={isInvalid}>
			<div className="flex items-center justify-between">
				<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

				{/* Toolbar: mode, actions, preview, count */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						size="sm"
						variant="secondary"
						onClick={() => setOpen(true)}
						className="h-8"
					>
						<Eye className="mr-1 h-3.5 w-3.5" />
						Preview
					</Button>

					{mode === 'markdown' ? (
						<div className="flex items-center gap-1">
							<Toggle
								size="sm"
								aria-label="Bold"
								onPressedChange={() => actions.bold?.()}
							>
								<Bold className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Italic"
								onPressedChange={() => actions.italic?.()}
							>
								<Italic className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Heading 3"
								onPressedChange={() => actions.h3?.()}
							>
								<Heading3 className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="List"
								onPressedChange={() => actions.ul?.()}
							>
								<List className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Quote"
								onPressedChange={() => actions.quote?.()}
							>
								<Quote className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Code block"
								onPressedChange={() => actions.code?.()}
							>
								<Code className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Link"
								onPressedChange={() => actions.link?.()}
							>
								<LinkIcon className="h-4 w-4" />
							</Toggle>
						</div>
					) : (
						<div className="flex items-center gap-1">
							<Toggle
								size="sm"
								aria-label="Bold"
								onPressedChange={() => actions.b_html?.()}
							>
								<Bold className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Italic"
								onPressedChange={() => actions.i_html?.()}
							>
								<Italic className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Heading 3"
								onPressedChange={() => actions.h3_html?.()}
							>
								<Heading3 className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="List"
								onPressedChange={() => actions.ul_html?.()}
							>
								<List className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Quote"
								onPressedChange={() => actions.blockquote_html?.()}
							>
								<Quote className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Code block"
								onPressedChange={() => actions.code_html?.()}
							>
								<Code className="h-4 w-4" />
							</Toggle>
							<Toggle
								size="sm"
								aria-label="Link"
								onPressedChange={() => actions.link_html?.()}
							>
								<LinkIcon className="h-4 w-4" />
							</Toggle>
						</div>
					)}
				</div>
			</div>

			<InputGroup className="mt-1">
				<Textarea
					ref={taRef}
					id={field.name}
					name={field.name}
					data-slot="input-group-control"
					className="min-h-48 resize-y field-sizing-content px-3 py-2 text-base"
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					value={value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={isInvalid}
					maxLength={maxLength}
				/>
				<InputGroupAddon align="block-end">
					<span
						className="px-2 py-1 text-xs text-muted-foreground tabular-nums"
						aria-live="polite"
					>
						{charCount}
						{typeof maxLength === 'number' ? ` / ${maxLength}` : ''} chars
					</span>
				</InputGroupAddon>
			</InputGroup>

			{description && (
				<FieldDescription className="mt-1">{description}</FieldDescription>
			)}
			{isInvalid && <FieldError errors={errors} />}

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
					</DialogHeader>
					<div className="prose dark:prose-invert max-w-none max-h-[70vh] overflow-auto">
						{mode === 'markdown' ? (
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
						) : (
							<div dangerouslySetInnerHTML={{ __html: safeHtml }} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

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
	const combined = [
		...(Array.isArray(field.state.meta.errors)
			? (field.state.meta.errors as any)
			: []),
		...submitField,
		...syncField,
	];
	const errors = normalizeFieldErrors(combined as any) ?? [];
	const isInvalid = errors.length > 0;

	const [open, setOpen] = React.useState(false);
	const [mode, setMode] = React.useState<Mode>(initialMode);
	const taRef = React.useRef<HTMLTextAreaElement | null>(null);

	const value = (field.state.value ?? '') as string;
	const charCount = value.length;
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
		link: () => replaceSelection('[', '](https://)', (s) => s || 'link text'),
	};

	const html = {
		bold: () => replaceSelection('<strong>', '</strong>'),
		italic: () => replaceSelection('<em>', '</em>'),
		h3: () => replaceSelection('<h3>', '</h3>', (s) => s || 'Heading'),
		ul: () =>
			replaceSelection('', '', (s) => {
				const lines = (s || 'item').split(/\n/);
				const lis = lines.map((l) => `<li>${l || 'item'}</li>`).join('');
				return `<ul>${lis}</ul>`;
			}),
		quote: () =>
			replaceSelection('<blockquote>', '</blockquote>', (s) => s || 'quote'),
		code: () =>
			replaceSelection('<pre><code>', '</code></pre>', (s) => s || 'code'),
		link: () =>
			replaceSelection('<a href="https://">', '</a>', (s) => s || 'link text'),
	};

	const A = mode === 'markdown' ? md : html;

	return (
		<UIField data-invalid={isInvalid}>
			<div className="flex items-center justify-between">
				<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>

				{/* Menubar */}
				<Menubar className="h-9">
					<MenubarMenu>
						<MenubarTrigger>Mode</MenubarTrigger>
						<MenubarContent>
							<MenubarItem
								onClick={() => setMode('markdown')}
								inset
							>
								Markdown{' '}
								{mode === 'markdown' && <MenubarShortcut>✓</MenubarShortcut>}
							</MenubarItem>
							<MenubarItem
								onClick={() => setMode('html')}
								inset
							>
								HTML {mode === 'html' && <MenubarShortcut>✓</MenubarShortcut>}
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
							<MenubarItem onClick={A.ul}>Bullet List</MenubarItem>
							<MenubarItem onClick={A.quote}>Blockquote</MenubarItem>
							<MenubarItem onClick={A.code}>Code Block</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={A.link}>Link…</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger>View</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={() => setOpen(true)}>
								<Eye className="mr-2 h-3.5 w-3.5" /> Preview
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger>
							<Badge
								variant="secondary"
								className="ml-0 tabular-nums"
							>
								{charCount}
								{typeof maxLength === 'number' ? ` / ${maxLength}` : ''} chars
							</Badge>
						</MenubarTrigger>
					</MenubarMenu>
				</Menubar>
			</div>

			<InputGroup className="mt-2">
				<Textarea
					ref={taRef}
					id={field.name}
					name={field.name}
					data-slot="input-group-control"
					className="min-h-48 resize-y field-sizing-content px-3 py-2 text-base"
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					value={value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={isInvalid}
					maxLength={maxLength}
				/>
				<InputGroupAddon align="block-end">
					<span
						className="px-2 py-1 text-xs text-muted-foreground tabular-nums"
						aria-live="polite"
					>
						{charCount}
						{typeof maxLength === 'number' ? ` / ${maxLength}` : ''} chars
					</span>
				</InputGroupAddon>
			</InputGroup>

			{description && (
				<FieldDescription className="mt-1">{description}</FieldDescription>
			)}
			{isInvalid && <FieldError errors={errors} />}

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
					</DialogHeader>
					<div className="prose dark:prose-invert max-w-none max-h-[70vh] overflow-auto">
						{mode === 'markdown' ? (
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
						) : (
							<div dangerouslySetInnerHTML={{ __html: safeHtml }} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</UIField>
	);
}

export function YoutubeLinkField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	// Extracts YouTube video ID from a full or short URL
	function extractYouTubeId(url: string): string | null {
		try {
			const u = new URL(url);
			if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
			if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
			return null;
		} catch {
			return null;
		}
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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

				const currentVal = field.state.value ?? '';

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? 'YouTube Link'}
						</FieldLabel>

						<div className="relative flex items-center">
							<Youtube className="absolute left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id={field.name}
								name={field.name}
								type="url"
								placeholder="https://www.youtube.com/watch?v=xxxxxxx"
								value={currentVal}
								onChange={(e) => {
									const url = e.target.value;
									const id = extractYouTubeId(url);
									field.handleChange(id ?? url);
								}}
								onBlur={field.handleBlur}
								aria-invalid={isInvalid}
								className="pl-9"
							/>
						</div>

						{isInvalid && <FieldError errors={errors} />}

						{currentVal && (
							<p className="text-xs text-muted-foreground mt-1">
								Extracted ID: <span className="font-mono">{currentVal}</span>
							</p>
						)}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

export function RumbleLinkField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	// Extracts Rumble video ID from URLs like:
	// https://rumble.com/embed/v6yjge4/?pub=4
	// https://rumble.com/v6yjge4-some-video.html
	function extractRumbleId(url: string): string | null {
		try {
			const u = new URL(url);
			if (!u.hostname.includes('rumble.com')) return null;
			// /embed/v6yjge4/ or /v6yjge4-something
			const parts = u.pathname.split('/');
			const candidate = parts.find((p) => /^v[a-zA-Z0-9]+/.test(p));
			return candidate ?? null;
		} catch {
			return null;
		}
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}
		>
			{(errState: any) => {
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

				const currentVal = field.state.value ?? '';

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? 'Rumble Link'}
						</FieldLabel>

						<div className="relative flex items-center">
							{/* // TODO: Replace RSS with Rumble Logo */}
							<Rss className="absolute left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id={field.name}
								name={field.name}
								type="url"
								placeholder="https://rumble.com/embed/vxxxxxx/"
								value={currentVal}
								onChange={(e) => {
									const url = e.target.value;
									const id = extractRumbleId(url);
									field.handleChange(id ?? url);
								}}
								onBlur={field.handleBlur}
								aria-invalid={isInvalid}
								className="pl-9"
							/>
						</div>

						{isInvalid && <FieldError errors={errors} />}

						{currentVal && (
							<p className="text-xs text-muted-foreground mt-1">
								Extracted ID: <span className="font-mono">{currentVal}</span>
							</p>
						)}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

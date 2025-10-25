'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ChevronsUpDownIcon, CheckIcon, XIcon } from 'lucide-react';
import type { ChannelRecord, CategoryRecord } from '@inverted-tech/fragments/Settings';
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
					<UIField
						data-invalid={isInvalid}
						orientation="responsive"
					>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<Switch
							id={field.name}
							name={field.name}
							checked={!!field.state.value}
							onCheckedChange={(v) => field.handleChange(!!v)}
							aria-invalid={isInvalid}
							className="w-auto"
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
					<UIField
						data-invalid={isInvalid}
						orientation="responsive"
					>
						<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
						<ToggleGroup
							type="single"
							value={value ? 'on' : 'off'}
							onValueChange={(v) => {
								if (!v) return;
								field.handleChange(v === 'on');
							}}
							className="w-fit"
							variant="outline"
							size="lg"
						>
							<ToggleGroupItem value="on">{onLabel}</ToggleGroupItem>
							<ToggleGroupItem value="off">{offLabel}</ToggleGroupItem>
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
  if (r?.AssetID) return `http://localhost:8081/api/cms/asset/image/${r.AssetID}/data`;
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
          const pub = (one?.value?.Public ?? one?.value?.public ?? one?.value) as any;
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
              <div className="text-sm">{field.state.value ?? 'No image selected'}</div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="ml-auto">
                    Browse
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogTitle>Select Image</DialogTitle>
                  {loading ? (
                    <div className="text-muted-foreground text-sm">Loading…</div>
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
            const pub = (one?.value?.Public ?? one?.value?.public ?? one?.value) as any;
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
            setSrc(`http://localhost:8081/api/cms/asset/image/${img.AssetID}/data`);
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
        <img src={src} alt={img.Title ?? ''} className="h-28 w-full object-cover sm:h-32" />
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
    <form.Subscribe selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}>
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
            <Popover open={open} onOpenChange={setOpen}>
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
    <form.Subscribe selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}>
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
                <div className="text-muted-foreground text-sm">No items selected</div>
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
              <Button type="button" variant="outline" onClick={() => addItem(input)}>
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
    <form.Subscribe selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}>
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
                <div className="text-muted-foreground text-sm">No channels selected</div>
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
              <Popover open={open} onOpenChange={setOpen}>
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
                    <div className="text-muted-foreground p-3 text-sm">Loading…</div>
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
    <form.Subscribe selector={(s: any) => ({ submit: s?.submitErrors, sync: s?.errors })}>
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
                <div className="text-muted-foreground text-sm">No categories selected</div>
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
              <Popover open={open} onOpenChange={setOpen}>
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
                    <div className="text-muted-foreground p-3 text-sm">Loading…</div>
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

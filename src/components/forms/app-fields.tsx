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

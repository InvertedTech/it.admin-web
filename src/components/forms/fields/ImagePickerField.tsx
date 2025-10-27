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
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

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

function ImageTile({
	img,
	onSelect,
}: {
	img: ImageRecord;
	onSelect: (id: string) => void;
}) {
	const [src, setSrc] = React.useState<string | null>(null);
	React.useEffect(() => {
		const direct = srcFromImageRecord(img);
		if (direct) return void setSrc(direct);
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
						const pub =
							imageRec?.Public ?? imageRec?.public ?? imageRec;
						dataObj = pub?.Data ?? pub?.data ?? {};
					}
					const b64 = dataObj?.Data ?? dataObj?.data;
					const mime =
						dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
					if (typeof b64 === 'string' && b64.length > 0)
						setSrc(`data:${mime};base64,${b64}`);
					else
						setSrc(
							`http://localhost:8081/api/cms/asset/image/${img.AssetID}/data`
						);
				})
				.catch(() => setSrc(null));
		}
	}, [img]);

	return (
		<button
			type='button'
			className='focus-visible:ring-ring hover:ring-ring group relative overflow-hidden rounded border outline-none ring-2 ring-transparent'
			onClick={() => img.AssetID && onSelect(img.AssetID)}
		>
			{src ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={src}
					alt={img.Title ?? ''}
					className='h-28 w-full object-cover sm:h-32'
				/>
			) : (
				<div className='text-muted-foreground flex h-28 w-full items-center justify-center text-xs sm:h-32'>
					No preview
				</div>
			)}
			<div className='bg-background/70 text-foreground absolute bottom-0 left-0 right-0 truncate px-2 py-1 text-xs'>
				{img.Title ?? img.AssetID}
			</div>
		</button>
	);
}

export function ImagePickerField({ label = 'Image' }: { label?: string }) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();

	const [open, setOpen] = React.useState(false);
	const [images, setImages] = React.useState<ImageRecord[]>([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (!open || images.length) return;
		setLoading(true);
		fetch('/api/assets/images')
			.then((r) => r.json())
			.then((j) => setImages((j?.Records as ImageRecord[]) ?? []))
			.finally(() => setLoading(false));
	}, [open, images.length]);

	const [fallbackSrc, setFallbackSrc] = React.useState<string | null>(null);
	const selected = React.useMemo(
		() => images.find((i) => i.AssetID === field.state.value),
		[images, field.state.value]
	);
	const directSrc = selected ? srcFromImageRecord(selected) : undefined;

	React.useEffect(() => {
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
					const pub =
						imageRec?.Public ?? imageRec?.public ?? imageRec;
					dataObj = pub?.Data ?? pub?.data ?? {};
				}
				const b64 = dataObj?.Data ?? dataObj?.data;
				const mime =
					dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
				if (typeof b64 === 'string' && b64.length > 0)
					setFallbackSrc(`data:${mime};base64,${b64}`);
			})
			.catch(() => {});
	}, [field.state.value, directSrc]);

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
						<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 overflow-hidden rounded border bg-muted'>
								{directSrc || fallbackSrc ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={
											(directSrc ?? fallbackSrc) as string
										}
										alt={selected?.Title ?? 'Selected'}
										className='h-full w-full object-cover'
									/>
								) : (
									<div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
										—
									</div>
								)}
							</div>
							<div className='text-sm'>
								{field.state.value ?? 'No image selected'}
							</div>

							<Dialog open={open} onOpenChange={setOpen}>
								<DialogTrigger asChild>
									<Button
										type='button'
										variant='outline'
										className='ml-auto'
									>
										Browse
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-4xl'>
									<DialogTitle>Select Image</DialogTitle>
									{loading ? (
										<div className='text-muted-foreground text-sm'>
											Loading…
										</div>
									) : (
										<div className='grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4'>
											{images.map((img) => (
												<ImageTile
													key={
														img.AssetID ??
														Math.random()
													}
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
									type='button'
									variant='ghost'
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

'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';
import { toast } from 'sonner';
import { createAsset } from '@/app/actions/assets';
import { create } from '@bufbuild/protobuf';
import { CreateAssetRequestSchema } from '@inverted-tech/fragments/Content';
import { ImageAssetDataSchema } from '@inverted-tech/fragments/Content/ImageAssetRecord_pb';
import { slugify } from '@/lib/slugify';

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
	if (r?.AssetID) return `/api/assets/image/${r.AssetID}/data`;
	return null;
}

function formatBytes(bytes?: number | null) {
	if (!bytes || bytes <= 0) return '-';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const sizes = ['B', 'KB', 'MB', 'GB'];
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function UploadArea({
	label,
	help,
	accept,
	onFile,
	fileName,
	fileSize,
	onClear,
}: {
	label: string;
	help?: string;
	accept: string;
	onFile: (file: File) => void;
	fileName?: string | null;
	fileSize?: number | null;
	onClear?: () => void;
}) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const [isOver, setIsOver] = React.useState(false);

	return (
		<div
			className={
				'rounded-md border p-4 transition-colors ' +
				(isOver ? 'bg-accent/30 border-primary' : 'bg-background')
			}
			onDragOver={(e) => {
				e.preventDefault();
				setIsOver(true);
			}}
			onDragLeave={() => setIsOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsOver(false);
				const f = e.dataTransfer.files?.[0];
				if (f) onFile(f);
			}}
		>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<div className='text-sm font-medium'>{label}</div>
					{help && (
						<div className='text-muted-foreground text-xs'>
							{help}
						</div>
					)}
					{fileName && (
						<div className='text-xs mt-1'>
							<span className='font-medium'>Selected:</span>{' '}
							{fileName}
							{typeof fileSize === 'number' && (
								<span className='text-muted-foreground'>
									{' '}
									- {formatBytes(fileSize)}
								</span>
							)}
						</div>
					)}
				</div>
				<div className='flex gap-2'>
					{fileName && onClear ? (
						<Button
							type='button'
							variant='outline'
							onClick={onClear}
						>
							Remove
						</Button>
					) : null}
					<Button
						type='button'
						variant='outline'
						onClick={() => inputRef.current?.click()}
					>
						Choose File
					</Button>
					<input
						ref={inputRef}
						type='file'
						accept={accept}
						hidden
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) onFile(f);
						}}
					/>
				</div>
			</div>
		</div>
	);
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
					let urlFromRec: string | null = null;
					if (one?.case === 'Image' || one?.case === 'image') {
						const pub = (one?.value?.Public ??
							one?.value?.public ??
							one?.value) as any;
						dataObj = pub?.Data ?? pub?.data ?? {};
						urlFromRec =
							pub?.URL ??
							pub?.Url ??
							pub?.Data?.URL ??
							pub?.data?.url ??
							null;
					} else if (rec?.Image || rec?.image) {
						const imageRec = rec?.Image ?? rec?.image;
						const pub =
							imageRec?.Public ?? imageRec?.public ?? imageRec;
						dataObj = pub?.Data ?? pub?.data ?? {};
						urlFromRec =
							pub?.URL ??
							pub?.Url ??
							pub?.Data?.URL ??
							pub?.data?.url ??
							null;
					}
					const b64 = dataObj?.Data ?? dataObj?.data;
					const mime =
						dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
					if (typeof b64 === 'string' && b64.length > 0)
						setSrc(`data:${mime};base64,${b64}`);
					else if (urlFromRec) setSrc(String(urlFromRec));
					else setSrc(`/api/assets/image/${img.AssetID}/data`);
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
	const [mode, setMode] = React.useState<'browse' | 'upload'>('browse');

	const [uploading, setUploading] = React.useState(false);
	const [uploadError, setUploadError] = React.useState<string | null>(null);
	const [fileMeta, setFileMeta] = React.useState<{
		name: string;
		size: number;
	} | null>(null);
	const [uploadMime, setUploadMime] = React.useState('');
	const [uploadTitle, setUploadTitle] = React.useState('');
	const [uploadCaption, setUploadCaption] = React.useState('');
	const [uploadWidth, setUploadWidth] = React.useState(0);
	const [uploadHeight, setUploadHeight] = React.useState(0);
	const [uploadData, setUploadData] = React.useState<Uint8Array | null>(null);
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

	const loadImages = React.useCallback(() => {
		setLoading(true);
		return fetch('/api/assets/images')
			.then((r) => r.json())
			.then((j) => setImages((j?.Records as ImageRecord[]) ?? []))
			.finally(() => setLoading(false));
	}, []);

	React.useEffect(() => {
		if (!open || images.length) return;
		void loadImages();
	}, [open, images.length, loadImages]);

	const [fallbackSrc, setFallbackSrc] = React.useState<string | null>(null);
	const selected = React.useMemo(
		() => images.find((i) => i.AssetID === field.state.value),
		[images, field.state.value],
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

	React.useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	async function onFileSelected(file: File) {
		setUploadError(null);
		const buffer = new Uint8Array(await file.arrayBuffer());
		setUploadMime(file.type || '');
		setUploadData(buffer);
		setFileMeta({ name: file.name, size: file.size });
		if (!uploadTitle) {
			const baseName = file.name.replace(/\.[^.]+$/, '');
			setUploadTitle(baseName);
		}
		try {
			const url = URL.createObjectURL(file);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(url);
			const img = new Image();
			img.onload = () => {
				setUploadWidth((img as any).naturalWidth || img.width || 0);
				setUploadHeight((img as any).naturalHeight || img.height || 0);
			};
			img.src = url;
		} catch {}
	}

	function resetUploadState() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);
		setFileMeta(null);
		setUploadMime('');
		setUploadTitle('');
		setUploadCaption('');
		setUploadWidth(0);
		setUploadHeight(0);
		setUploadData(null);
		setUploadError(null);
	}

	async function submitUpload() {
		setUploadError(null);
		if (!uploadData || uploadData.length === 0) {
			setUploadError('Please choose a file to upload.');
			return;
		}
		if (!uploadTitle.trim()) {
			setUploadError('Please enter a title.');
			return;
		}
		setUploading(true);
		try {
			const req = create(CreateAssetRequestSchema, {
				CreateAssetRequestOneof: {
					case: 'Image',
					value: create(ImageAssetDataSchema, {
						Public: {
							Title: uploadTitle.trim(),
							Caption: uploadCaption.trim(),
							URL: slugify(uploadTitle.trim()),
							MimeType: uploadMime || 'image/png',
							Height: uploadHeight || 0,
							Width: uploadWidth || 0,
							Data: uploadData,
						},
						Private: { OldAssetID: '' },
					}),
				},
			});
			const res = await createAsset(req);
			const rec = (res as any)?.Record ?? (res as any)?.record ?? res;
			const assetId =
				rec?.AssetID ??
				rec?.assetId ??
				rec?.assetID ??
				rec?.Image?.AssetID ??
				rec?.image?.assetId ??
				rec?.Image?.Public?.AssetID ??
				rec?.image?.public?.assetId ??
				rec?.Image?.Public?.AssetId ??
				rec?.image?.public?.assetId;
			if (!assetId) {
				toast('Upload failed', {
					description: 'Could not read the new asset ID.',
				});
				setUploadError(
					'Upload completed but no asset ID was returned.',
				);
				return;
			}

			await loadImages();
			field.handleChange(assetId);
			setMode('browse');
			setOpen(false);
			toast('Image uploaded', { description: assetId });
			resetUploadState();
		} catch (err) {
			console.error(err);
			setUploadError('Upload failed. Please try again.');
			toast('Upload failed', {
				description: 'Could not create image asset.',
			});
		} finally {
			setUploading(false);
		}
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
						<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
						<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
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
							<div
								className='min-w-0 flex-1 text-sm'
								title={field.state.value ?? 'No image selected'}
							>
								<div className='truncate'>
									{field.state.value ??
										'No image selected'}
								</div>
							</div>

							<div className='flex flex-wrap items-center gap-2 sm:ml-auto'>
								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button
											type='button'
											variant='outline'
										>
											Browse
										</Button>
									</DialogTrigger>
									<DialogContent className='sm:max-w-4xl'>
										<DialogTitle>Images</DialogTitle>
										<div className='mb-3 flex items-center gap-2'>
											<Button
												type='button'
												variant={
													mode === 'browse'
														? 'default'
														: 'outline'
												}
												onClick={() =>
													setMode('browse')
												}
											>
												Browse
											</Button>
											<Button
												type='button'
												variant={
													mode === 'upload'
														? 'default'
														: 'outline'
												}
												onClick={() =>
													setMode('upload')
												}
											>
												Upload
											</Button>
										</div>

										{mode === 'upload' ? (
											<div className='space-y-4'>
												<UploadArea
													label='Upload Image'
													help='PNG, JPEG, GIF supported.'
													accept='image/*'
													onFile={onFileSelected}
													fileName={fileMeta?.name}
													fileSize={
														fileMeta?.size ?? null
													}
													onClear={resetUploadState}
												/>
												{previewUrl && (
													<div className='rounded-md border p-3'>
														<div className='text-sm mb-2 font-medium'>
															Preview
														</div>
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={previewUrl}
															alt='Selected image preview'
															className='max-h-64 w-auto rounded'
														/>
													</div>
												)}
												<div className='grid gap-3 sm:grid-cols-2'>
													<div className='space-y-1'>
														<div className='text-xs font-medium'>
															Title
														</div>
														<Input
															value={uploadTitle}
															onChange={(e) =>
																setUploadTitle(
																	e.target
																		.value,
																)
															}
															placeholder='Title'
														/>
													</div>
													<div className='space-y-1 sm:col-span-2'>
														<div className='text-xs font-medium'>
															Caption (optional)
														</div>
														<Textarea
															value={
																uploadCaption
															}
															onChange={(e) =>
																setUploadCaption(
																	e.target
																		.value,
																)
															}
															placeholder='Caption'
														/>
													</div>
												</div>
												{uploadError && (
													<div className='text-destructive text-sm'>
														{uploadError}
													</div>
												)}
												<div className='flex justify-end gap-2'>
													<Button
														type='button'
														variant='outline'
														onClick={() =>
															resetUploadState()
														}
														disabled={uploading}
													>
														Clear
													</Button>
													<Button
														type='button'
														onClick={
															submitUpload
														}
														disabled={uploading}
													>
														{uploading
															? 'Uploading...'
															: 'Upload'}
													</Button>
												</div>
											</div>
										) : loading ? (
											<div className='text-muted-foreground text-sm'>
												Loading...
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
															field.handleChange(
																id,
															);
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
										onClick={() =>
											field.handleChange('')
										}
									>
										Clear
									</Button>
								)}
							</div>
						</div>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

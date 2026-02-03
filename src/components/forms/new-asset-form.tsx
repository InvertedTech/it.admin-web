'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { toast } from 'sonner';
import { createAsset } from '@/app/actions/assets';
import { AudioAssetDataSchema } from '@inverted-tech/fragments/Content/AudioAssetRecord_pb';
import { ImageAssetDataSchema } from '@inverted-tech/fragments/Content/ImageAssetRecord_pb';
import { create } from '@bufbuild/protobuf';
import { CreateAssetRequestSchema } from '@inverted-tech/fragments/Content';

function slugify(input: string): string {
	return (input ?? '')
		.toLowerCase()
		.trim()
		.replace(/[']/g, '')
		.replace(/\//g, '-')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export function NewAssetForm() {
	const [tab, setTab] = useState<'image' | 'audio'>('image');
	return (
		<div className="space-y-6">
			<div className="flex gap-2">
				<Button
					variant={tab === 'image' ? 'default' : 'outline'}
					onClick={() => setTab('image')}
				>
					Image
				</Button>
				<Button
					variant={tab === 'audio' ? 'default' : 'outline'}
					onClick={() => setTab('audio')}
				>
					Audio
				</Button>
			</div>
			{tab === 'image' ? <NewImageAssetForm /> : <NewAudioAssetForm />}
		</div>
	);
}

function formatBytes(bytes?: number | null) {
	if (!bytes || bytes <= 0) return '—';
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
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isOver, setIsOver] = useState(false);

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
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="text-sm font-medium">{label}</div>
					{help && <div className="text-muted-foreground text-xs">{help}</div>}
					{fileName && (
						<div className="text-xs mt-1">
							<span className="font-medium">Selected:</span> {fileName}
							{typeof fileSize === 'number' && (
								<span className="text-muted-foreground">
									{' '}
									• {formatBytes(fileSize)}
								</span>
							)}
						</div>
					)}
				</div>
				<div className="flex gap-2">
					{fileName && onClear ? (
						<Button
							type="button"
							variant="outline"
							onClick={onClear}
						>
							Remove
						</Button>
					) : null}
					<Button
						type="button"
						variant="outline"
						onClick={() => inputRef.current?.click()}
					>
						Choose File
					</Button>
					<input
						ref={inputRef}
						type="file"
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

function AutoSlugger({
	form,
	titlePath,
	urlPath,
}: {
	form: any;
	titlePath: string;
	urlPath: string;
}) {
	return (
		<form.Subscribe selector={(s: any) => s?.values}>
			{(values: any) => {
				const title = (form.getFieldValue(titlePath) ?? '') as string;
				const url = (form.getFieldValue(urlPath) ?? '') as string;
				const desired = slugify(title);
				if (desired !== url && typeof form?.setFieldValue === 'function') {
					form.setFieldValue(urlPath, desired);
				}
				return null;
			}}
		</form.Subscribe>
	);
}

export function NewImageAssetForm() {
	const form = useProtoAppForm({
		schema: ImageAssetDataSchema,
		defaultInit: {
			Public: {
				Title: '',
				Caption: '',
				URL: '',
				MimeType: '',
				Height: 0,
				Width: 0,
				Data: new Uint8Array(),
			},
			Private: { OldAssetID: '' },
		},
		onSubmitAsync: async ({ value }) => {
			const req = create(CreateAssetRequestSchema, {
				CreateAssetRequestOneof: {
					case: 'Image',
					value: create(ImageAssetDataSchema, value),
				},
			});
			console.log(req);
			const res = await createAsset(req);
			console.log(res);
		},
	});

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileMeta, setFileMeta] = useState<{
		name: string;
		size: number;
	} | null>(null);

	async function onFileSelected(file: File) {
		const buffer = new Uint8Array(await file.arrayBuffer());
		form.setFieldValue('Public.MimeType', file.type || '');
		const baseName = file.name.replace(/\.[^.]+$/, '');
		const title = form.getFieldValue('Public.Title') || baseName;
		form.setFieldValue('Public.Title', title);
		form.setFieldValue('Public.Data', buffer);
		setFileMeta({ name: file.name, size: file.size });
		// Try to infer dimensions
		try {
			const url = URL.createObjectURL(file);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(url);
			const img = new Image();
			img.onload = () => {
				form.setFieldValue(
					'Public.Width',
					(img as any).naturalWidth || img.width || 0
				);
				form.setFieldValue(
					'Public.Height',
					(img as any).naturalHeight || img.height || 0
				);
				// keep URL for preview, revoke on next select/unmount
			};
			img.src = url;
		} catch {}
	}

	return (
		<FormCard
			cardTitle="Create Image Asset"
			cardDescription="Upload and describe an image."
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					{
						<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
							{(errs: any) => <FormSubmitErrors errors={errs} />}
						</form.Subscribe>
					}
					<AutoSlugger
						form={form}
						titlePath="Public.Title"
						urlPath="Public.URL"
					/>

					<FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="md:col-span-2">
							<UploadArea
								label="Upload Image"
								help="PNG, JPEG, GIF supported. Drag and drop or choose file."
								accept="image/*"
								onFile={onFileSelected}
							fileName={fileMeta?.name}
							fileSize={fileMeta?.size ?? null}
							onClear={() => {
								if (previewUrl) URL.revokeObjectURL(previewUrl);
								setPreviewUrl(null);
								setFileMeta(null);
								form.setFieldValue('Public.Data', new Uint8Array());
								form.setFieldValue('Public.MimeType', '');
								form.setFieldValue('Public.Width', 0);
								form.setFieldValue('Public.Height', 0);
							}}
						/>
					</div>
					{previewUrl && (
						<div className="md:col-span-2">
							<div className="rounded-md border p-3">
								<div className="text-sm mb-2 font-medium">Preview</div>
								<img
									src={previewUrl}
									alt="Selected image preview"
									className="max-h-64 w-auto rounded"
								/>
							</div>
						</div>
					)}

					<form.AppField
						name="Public.Title"
						children={(field) => <field.TextField label="Title" />}
					/>
					<form.AppField
						name="Public.URL"
						children={(field) => (
							<field.TextField
								label="URL"
								disabled
							/>
						)}
					/>
					<div className="md:col-span-2">
						<form.AppField
							name="Public.Caption"
							children={(field) => <field.TextField label="Caption" />}
						/>
					</div>
					{/* Hidden/auto fields: Public.MimeType, Public.Width, Public.Height, Private.OldAssetID */}

						<Field className="md:col-span-2 flex items-center justify-end">
							{
								<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
									{(isSubmitting: boolean) => (
										<Button
											type="submit"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Spinner className="mr-2" /> Validating...
												</>
											) : (
												'Validate'
											)}
										</Button>
									)}
								</form.Subscribe>
							}
						</Field>
					</FieldGroup>
				</form.AppForm>
			</form>
		</FormCard>
	);
}

export function NewAudioAssetForm() {
	const form = useProtoAppForm({
		schema: AudioAssetDataSchema,
		defaultInit: {
			Public: {
				Title: '',
				Caption: '',
				URL: '',
				MimeType: '',
				LengthSeconds: 0,
				Data: new Uint8Array(),
			},
			Private: { OldAssetID: '' },
		},
		onSubmitAsync: async ({ value }) => {
			const req = { CreateAssetRequestOneof: { case: 'Audio', value } } as any;
			const res = await createAsset(req);
			if ((res as any)?.Record?.AssetID) {
				toast('Audio uploaded', { description: (res as any)?.Record?.AssetID });
			} else {
				toast('Upload failed', { description: 'Could not create audio asset' });
			}
		},
	});

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileMeta, setFileMeta] = useState<{
		name: string;
		size: number;
	} | null>(null);

	async function onFileSelected(file: File) {
		const buffer = new Uint8Array(await file.arrayBuffer());
		form.setFieldValue('Public.MimeType', file.type || '');
		const baseName = file.name.replace(/\.[^.]+$/, '');
		const title = form.getFieldValue('Public.Title') || baseName;
		form.setFieldValue('Public.Title', title);
		form.setFieldValue('Public.Data', buffer);
		setFileMeta({ name: file.name, size: file.size });
		// Try to infer duration
		try {
			const url = URL.createObjectURL(file);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(url);
			const audio = new Audio(url);
			audio.addEventListener('loadedmetadata', () => {
				const dur = Math.round(audio.duration || 0);
				if (Number.isFinite(dur))
					form.setFieldValue('Public.LengthSeconds', dur);
			});
		} catch {}
	}

	return (
		<FormCard
			cardTitle="Create Audio Asset"
			cardDescription="Upload and describe an audio file."
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					{
						<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
							{(errs: any) => <FormSubmitErrors errors={errs} />}
						</form.Subscribe>
					}
					<AutoSlugger
						form={form}
						titlePath="Public.Title"
						urlPath="Public.URL"
					/>

					<FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="md:col-span-2">
							<UploadArea
								label="Upload Audio"
								help="MP3, WAV, AAC supported. Drag and drop or choose file."
								accept="audio/*"
								onFile={onFileSelected}
							fileName={fileMeta?.name}
							fileSize={fileMeta?.size ?? null}
							onClear={() => {
								if (previewUrl) URL.revokeObjectURL(previewUrl);
								setPreviewUrl(null);
								setFileMeta(null);
								form.setFieldValue('Public.Data', new Uint8Array());
								form.setFieldValue('Public.MimeType', '');
								form.setFieldValue('Public.LengthSeconds', 0);
							}}
						/>
					</div>
					{previewUrl && (
						<div className="md:col-span-2">
							<div className="rounded-md border p-3">
								<div className="text-sm mb-2 font-medium">Preview</div>
								<audio
									src={previewUrl}
									controls
									className="w-full"
								/>
							</div>
						</div>
					)}

					<form.AppField
						name="Public.Title"
						children={(field) => <field.TextField label="Title" />}
					/>
					<form.AppField
						name="Public.URL"
						children={(field) => (
							<field.TextField
								label="URL"
								disabled
							/>
						)}
					/>
					<div className="md:col-span-2">
						<form.AppField
							name="Public.Caption"
							children={(field) => <field.TextField label="Caption" />}
						/>
					</div>
					{/* Hidden/auto fields: Public.MimeType, Public.LengthSeconds, Private.OldAssetID */}

						<Field className="md:col-span-2 flex items-center justify-end">
							{
								<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
									{(isSubmitting: boolean) => (
										<Button
											type="submit"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Spinner className="mr-2" /> Validating...
												</>
											) : (
												'Validate'
											)}
										</Button>
									)}
								</form.Subscribe>
							}
						</Field>
					</FieldGroup>
				</form.AppForm>
			</form>
		</FormCard>
	);
}

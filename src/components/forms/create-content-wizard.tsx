'use client';

import * as React from 'react';
import { create } from '@bufbuild/protobuf';
import {
	CreateContentRequestSchema,
	VideoContentPublicDataSchema,
	WrittenContentPublicDataSchema,
	AudioContentPublicDataSchema,
	PictureContentPublicDataSchema,
} from '@inverted-tech/fragments/Content';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { createContent } from '@/app/actions/content';
import ContentPublicDataFieldGroups from './groups/content/content-public-data-field-groups';
import ContentDetailsFields from './groups/content/content-details-fields';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

/** ——————— Inline body export ——————— */
export function CreateContentWizard({ onDone }: { onDone?: () => void }) {
	const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

	const form = useProtoAppForm({
		schema: CreateContentRequestSchema,
		defaultInit: {
			Public: {
				ContentDataOneof: {
					case: 'Video',
					value: create(VideoContentPublicDataSchema) as any,
				},
			},
			Private: {
				ContentDataOneof: { case: 'Video', value: {} },
			},
		} as any,
		onValidSubmit: async ({ value }) => {
			const req = create(CreateContentRequestSchema, value);
			await createContent(req);
			onDone?.();
		},
	});

	const detailsFields = {
		Title: 'Public.Title',
		Description: 'Public.Description',
		Author: 'Public.Author',
		URL: 'Public.URL',
		FeaturedImageAssetID: 'Public.FeaturedImageAssetID',
		SubscriptionLevel: 'Public.SubscriptionLevel',
		Tags: 'Public.Tags',
		ChannelIds: 'Public.ChannelIds',
		CategoryIds: 'Public.CategoryIds',
	} as const;

	const videoFields = {
		HtmlBody: 'Public.ContentDataOneof.value.HtmlBody',
		IsLiveStream: 'Public.ContentDataOneof.value.IsLiveStream',
		IsLive: 'Public.ContentDataOneof.value.IsLive',
		RumbleVideoId: 'Public.ContentDataOneof.value.RumbleVideoId',
		YoutubeVideoId: 'Public.ContentDataOneof.value.YoutubeVideoId',
	} as const;

	const writtenFields = {
		HtmlBody: 'Public.ContentDataOneof.value.HtmlBody',
	} as const;
	const audioFields = {
		HtmlBody: 'Public.ContentDataOneof.value.HtmlBody',
	} as const;
	const pictureFields = {
		HtmlBody: 'Public.ContentDataOneof.value.HtmlBody',
	} as const;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (step < 4) setStep((s) => (s + 1) as any);
				else form.handleSubmit();
			}}
			className='space-y-6'
		>
			<form.AppForm>
				<AutoContentSlugger form={form} />
				<Stepper step={step} />
				<Separator />

				{step === 1 && (
					<form.Subscribe
						selector={(s: any) =>
							s.values?.Public?.ContentDataOneof?.case as
								| 'Video'
								| 'Written'
								| 'Audio'
								| 'Picture'
								| undefined
						}
					>
						{(current) => {
							const selected = (current as any) ?? 'Video';
							return (
								<div className='space-y-4'>
									<p className='text-sm text-muted-foreground'>
										Select content type.
									</p>
									<ToggleGroup
										type='single'
										value={selected}
										onValueChange={(v) => {
											if (!v) return;
											if (v === 'Video') {
												form.setFieldValue(
													'Public.ContentDataOneof',
													{
														case: 'Video',
														value: create(
															VideoContentPublicDataSchema
														) as any,
													} as any
												);
												form.setFieldValue(
													'Private.ContentDataOneof',
													{
														case: 'Video',
														value: {},
													} as any
												);
											} else if (v === 'Written') {
												form.setFieldValue(
													'Public.ContentDataOneof',
													{
														case: 'Written',
														value: create(
															WrittenContentPublicDataSchema
														) as any,
													} as any
												);
												form.setFieldValue(
													'Private.ContentDataOneof',
													{
														case: 'Written',
														value: {},
													} as any
												);
											} else if (v === 'Audio') {
												form.setFieldValue(
													'Public.ContentDataOneof',
													{
														case: 'Audio',
														value: create(
															AudioContentPublicDataSchema
														) as any,
													} as any
												);
												form.setFieldValue(
													'Private.ContentDataOneof',
													{
														case: 'Audio',
														value: {},
													} as any
												);
											} else if (v === 'Picture') {
												form.setFieldValue(
													'Public.ContentDataOneof',
													{
														case: 'Picture',
														value: create(
															PictureContentPublicDataSchema
														) as any,
													} as any
												);
												form.setFieldValue(
													'Private.ContentDataOneof',
													{
														case: 'Picture',
														value: {},
													} as any
												);
											}
										}}
										className='w-fit'
										variant='outline'
										size='lg'
									>
										<ToggleGroupItem value='Video'>
											Video
										</ToggleGroupItem>
										<ToggleGroupItem value='Written'>
											Written
										</ToggleGroupItem>
										<ToggleGroupItem value='Audio'>
											Audio
										</ToggleGroupItem>
										<ToggleGroupItem value='Picture'>
											Picture
										</ToggleGroupItem>
									</ToggleGroup>
								</div>
							);
						}}
					</form.Subscribe>
				)}

				{step === 2 && (
					<ContentDetailsFields
						form={form}
						fields={detailsFields as any}
					/>
				)}

				{step === 3 && (
					<form.Subscribe
						selector={(s: any) =>
							s.values?.Public?.ContentDataOneof?.case
						}
					>
						{(
							selected: 'Video' | 'Written' | 'Audio' | 'Picture'
						) => (
							<div className='space-y-4'>
								{selected === 'Video' && (
									<ContentPublicDataFieldGroups.VideoContentPublicDataFields
										title='Video'
										form={form}
										fields={videoFields as any}
									/>
								)}
								{selected === 'Written' && (
									<ContentPublicDataFieldGroups.WrittenContentPublicDataFields
										title='Written'
										form={form}
										fields={writtenFields as any}
									/>
								)}
								{selected === 'Audio' && (
									<ContentPublicDataFieldGroups.AudioContentPublicDataFields
										title='Audio'
										form={form}
										fields={audioFields as any}
									/>
								)}
								{selected === 'Picture' && (
									<ContentPublicDataFieldGroups.PictureContentPublicDataFields
										title='Picture'
										form={form}
										fields={pictureFields as any}
									/>
								)}
							</div>
						)}
					</form.Subscribe>
				)}

				{step === 4 && (
					<div className='space-y-3'>
						<p className='text-sm text-muted-foreground'>
							Review and submit.
						</p>
						<pre className='bg-muted/50 rounded-md p-3 text-xs overflow-auto'>
							{JSON.stringify(form?.state?.values ?? {}, null, 2)}
						</pre>
						<form.SubmitErrors />
					</div>
				)}

				<div className='mt-2 flex items-center justify-between'>
					<div className='text-muted-foreground text-sm'>
						Step {step} of 4
					</div>
					<div className='flex gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() =>
								setStep((s) => (s > 1 ? ((s - 1) as any) : s))
							}
							disabled={step === 1}
						>
							Back
						</Button>
						{step < 4 ? (
							<Button type='submit'>Next</Button>
						) : (
							<form.CreateButton label='Create' />
						)}
					</div>
				</div>
			</form.AppForm>
		</form>
	);
}

/** ——————— Dialog wrapper export ——————— */
export function CreateContentWizardDialog({
	trigger,
	inline = false,
	onDone,
}: {
	trigger?: React.ReactNode;
	inline?: boolean;
	onDone?: () => void;
}) {
	if (inline) return <CreateContentWizard onDone={onDone} />;

	const [open, setOpen] = React.useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? <Button>Create Content…</Button>}
			</DialogTrigger>
			<DialogContent className='sm:max-w-3xl'>
				<DialogHeader>
					<DialogTitle>Create Content</DialogTitle>
				</DialogHeader>
				<CreateContentWizard
					onDone={() => {
						setOpen(false);
						onDone?.();
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

/** ——————— helpers ——————— */
function Stepper({ step }: { step: number }) {
	return (
		<div className='grid grid-cols-4 gap-2 text-sm'>
			{['Type', 'Details', 'Content', 'Review'].map((label, i) => {
				const active = step === i + 1;
				const done = step > i + 1;
				return (
					<div
						key={label}
						className={[
							'rounded-md border px-3 py-2 text-center',
							active
								? 'border-primary text-primary'
								: done
								? 'border-muted-foreground/20 text-foreground'
								: 'text-muted-foreground',
						].join(' ')}
					>
						{label}
					</div>
				);
			})}
		</div>
	);
}

function slugify(input: string): string {
	return String(input)
		.toLowerCase()
		.trim()
		.replace(/[']/g, '')
		.replace(/\//g, '-')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function AutoContentSlugger({ form }: { form: any }) {
	return (
		<form.Subscribe selector={(s: any) => s?.values?.Public}>
			{(pub: any) => {
				const title = pub?.Title ?? '';
				const url = pub?.URL ?? '';
				const desired = slugify(title);
				if (
					desired !== url &&
					typeof form?.setFieldValue === 'function'
				) {
					form.setFieldValue('Public.URL', desired);
				}
				return null;
			}}
		</form.Subscribe>
	);
}

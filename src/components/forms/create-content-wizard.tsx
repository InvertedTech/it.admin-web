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
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { AutoContentSlugger } from './auto-content-slugger';
import { FileText, Image as ImageIcon, Mic2, Video } from 'lucide-react';
import { PublishContentForm } from './publish-content-form';
/** ——————— Inline body export ——————— */
export function CreateContentWizard({ onDone }: { onDone?: () => void }) {
	const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
	const [postSubmitOpen, setPostSubmitOpen] = React.useState(false);
	const [createdContentId, setCreatedContentId] = React.useState<string | null>(
		null,
	);
	const [nextStep, setNextStep] = React.useState<'choice' | 'publish'>(
		'choice',
	);
	const router = useRouter();
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
			const res = await createContent(req);
			if (res.Record && res.Record.Public?.ContentID !== '') {
				const id = res.Record.Public?.ContentID ?? null;
				setCreatedContentId(id);
				setNextStep('choice');
				setPostSubmitOpen(true);
			}
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
									<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
										{(
											[
												{
													key: 'Video',
													title: 'Video',
													description: 'Livestreams or hosted video.',
													icon: Video,
												},
												{
													key: 'Written',
													title: 'Written',
													description: 'Articles, posts, and stories.',
													icon: FileText,
												},
												{
													key: 'Audio',
													title: 'Audio',
													description: 'Podcast or audio-only content.',
													icon: Mic2,
												},
												{
													key: 'Picture',
													title: 'Picture',
													description: 'Single image with a caption.',
													icon: ImageIcon,
												},
											] as const
										).map((card) => {
											const active = selected === card.key;
											const Icon = card.icon;
											return (
												<Button
													key={card.key}
													type='button'
													variant='outline'
													aria-pressed={active}
													className={[
														'h-auto w-full items-start justify-start gap-3 rounded-lg px-4 py-4 text-left',
														'hover:-translate-y-0.5 hover:shadow-sm',
														active
															? 'border-primary/80 bg-primary text-foreground shadow-[0_0_0_2px_hsl(var(--primary)/0.45),0_6px_18px_-12px_hsl(var(--primary)/0.7)] dark:text-white'
															: 'bg-card',
													].join(' ')}
													onClick={() => {
														if (card.key === 'Video') {
															form.setFieldValue(
																'Public.ContentDataOneof',
																{
																	case: 'Video',
																	value: create(
																		VideoContentPublicDataSchema,
																	) as any,
																} as any,
															);
															form.setFieldValue(
																'Private.ContentDataOneof',
																{
																	case: 'Video',
																	value: {},
																} as any,
															);
														} else if (card.key === 'Written') {
															form.setFieldValue(
																'Public.ContentDataOneof',
																{
																	case: 'Written',
																	value: create(
																		WrittenContentPublicDataSchema,
																	) as any,
																} as any,
															);
															form.setFieldValue(
																'Private.ContentDataOneof',
																{
																	case: 'Written',
																	value: {},
																} as any,
															);
														} else if (card.key === 'Audio') {
															form.setFieldValue(
																'Public.ContentDataOneof',
																{
																	case: 'Audio',
																	value: create(
																		AudioContentPublicDataSchema,
																	) as any,
																} as any,
															);
															form.setFieldValue(
																'Private.ContentDataOneof',
																{
																	case: 'Audio',
																	value: {},
																} as any,
															);
														} else if (card.key === 'Picture') {
															form.setFieldValue(
																'Public.ContentDataOneof',
																{
																	case: 'Picture',
																	value: create(
																		PictureContentPublicDataSchema,
																	) as any,
																} as any,
															);
															form.setFieldValue(
																'Private.ContentDataOneof',
																{
																	case: 'Picture',
																	value: {},
																} as any,
															);
														}
													}}
												>
													<div className='flex min-w-0 flex-1 items-start gap-3'>
														<span
															className={[
																'flex size-10 items-center justify-center rounded-md border',
																active
																	? 'border-foreground/30 bg-foreground/10 text-foreground dark:border-white/30 dark:bg-white/10 dark:text-white'
																	: 'bg-muted/40 text-foreground',
															].join(' ')}
														>
															<Icon className='h-5 w-5' />
														</span>
														<div className='flex min-w-0 flex-1 flex-col gap-1'>
														<span className='text-sm font-semibold'>
															{card.title}
														</span>
														<span
															className={[
																'text-xs',
																active
																	? 'text-foreground/80 dark:text-white/80'
																	: 'text-muted-foreground',
															].join(' ')}
														>
															{card.description}
														</span>
														</div>
													</div>
												</Button>
											);
										})}
									</div>
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
							selected: 'Video' | 'Written' | 'Audio' | 'Picture',
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
					<div className='space-y-6'>
						<p className='text-sm text-muted-foreground'>
							Review and adjust details before submitting.
						</p>
						<section className='space-y-4'>
							<h3 className='text-sm font-semibold'>Details</h3>
							<ContentDetailsFields
								form={form}
								fields={detailsFields as any}
							/>
						</section>
						<section className='space-y-4'>
							<h3 className='text-sm font-semibold'>Content</h3>
							<form.Subscribe
								selector={(s: any) =>
									s.values?.Public?.ContentDataOneof?.case
								}
							>
								{(
									selected: 'Video' | 'Written' | 'Audio' | 'Picture',
								) => (
									<div className='rounded-lg border bg-muted/20 p-4'>
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
						</section>
						<form.SubmitErrors />
					</div>
				)}

				<div className='mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div className='text-muted-foreground text-sm'>
						Step {step} of 4
					</div>
					<div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
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
			<Dialog
				open={postSubmitOpen}
				onOpenChange={(open) => setPostSubmitOpen(open)}
			>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Publish now?</DialogTitle>
						<DialogDescription>
							Your content is created. You can publish it now, or skip this
							step.
						</DialogDescription>
					</DialogHeader>

					{nextStep === 'choice' && (
						<div className="grid gap-3 sm:grid-cols-2">
							<Button onClick={() => setNextStep('publish')}>Publish</Button>
							<Button
								variant="ghost"
								onClick={() => {
									setPostSubmitOpen(false);
									if (createdContentId) {
										onDone?.();
										router.push(`/content/${createdContentId}`);
									}
								}}
							>
								Skip for now
							</Button>
						</div>
					)}

					{nextStep === 'publish' && createdContentId && (
						<div className="space-y-4">
							<PublishContentForm
								contentId={createdContentId}
								onComplete={() => {
									setPostSubmitOpen(false);
									onDone?.();
									router.push(`/content/${createdContentId}`);
								}}
							/>
							<DialogFooter>
								<Button variant="ghost" onClick={() => setNextStep('choice')}>
									Back
								</Button>
								<Button variant="outline" type="submit" form="publish-content">
									Done
								</Button>
							</DialogFooter>
						</div>
					)}

				</DialogContent>
			</Dialog>
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
		<div className='grid grid-cols-2 gap-2 text-sm sm:grid-cols-4'>
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


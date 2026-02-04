'use client';

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import {
	CreateContentRequestSchema,
	VideoContentPublicDataSchema,
	WrittenContentPublicDataSchema,
	AudioContentPublicDataSchema,
	PictureContentPublicDataSchema,
} from '@inverted-tech/fragments/Content';
import ContentPublicDataFieldGroups from './groups/content/content-public-data-field-groups';
import ContentDetailsFields from './groups/content/content-details-fields';
import { FormCard } from './form-card';
import { createContent } from '@/app/actions/content';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export function CreateContentForm() {
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
				ContentDataOneof: {
					case: 'Video',
					value: {},
				},
			},
		} as any,
		onValidSubmit: async ({ value }) => {
			const req = create(CreateContentRequestSchema, value);
			const res = await createContent(req);
			if (res.Record && res.Record.Public?.ContentID !== '')
				router.push(`/content/${res.Record.Public?.ContentID}`);
			// TODO: Display Error
		},
	});

	// Map field groups to their locations in the proto shape
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
		<FormCard
			cardTitle='Create Content'
			cardDescription='Set the details, metadata, and body for your content.'
		>
			<form
				id='create-content'
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<AutoContentSlugger form={form} />
					<div className='space-y-8'>
						<section className='space-y-4'>
							<ContentDetailsFields
								form={form}
								fields={detailsFields as any}
							/>
						</section>

						<Separator />

						<section className='space-y-4'>
							<div className='space-y-1'>
								<h3 className='text-base font-semibold'>
									Content Type
								</h3>
								<p className='text-muted-foreground text-sm'>
									Choose how this content should render.
								</p>
							</div>
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
										<div className='space-y-6'>
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
													} else if (v === 'Written') {
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
													} else if (v === 'Audio') {
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
													} else if (v === 'Picture') {
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
												className='flex w-fit flex-wrap gap-2'
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
										</div>
									);
								}}
							</form.Subscribe>
						</section>

						{/* Show any validation/submit errors */}
						<form.SubmitErrors />
						{
							// Debug subscriptions to verify submitErrors and errors
						}
						<form.Subscribe selector={(s: any) => s?.submitErrors}>
							{(se: any) => {
								try {
									// eslint-disable-next-line no-console
									console.log(
										'[CreateContentForm] submitErrors',
										se,
									);
								} catch {}
								return null;
							}}
						</form.Subscribe>
						<form.Subscribe selector={(s: any) => s?.errors}>
							{(e: any) => {
								try {
									// eslint-disable-next-line no-console
									console.log('[CreateContentForm] errors', e);
								} catch {}
								return null;
							}}
						</form.Subscribe>

						<div className='flex items-center justify-end pt-2'>
							<form.CreateButton label='Create' />
						</div>
					</div>
				</form.AppForm>
			</form>
		</FormCard>
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

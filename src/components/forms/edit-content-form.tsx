'use client';

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import {
	ModifyContentRequestSchema,
	VideoContentPublicDataSchema,
	WrittenContentPublicDataSchema,
	AudioContentPublicDataSchema,
	PictureContentPublicDataSchema,
	type ContentRecord,
} from '@inverted-tech/fragments/Content';
import ContentPublicDataFieldGroups from './groups/content/content-public-data-field-groups';
import ContentDetailsFields from './groups/content/content-details-fields';
import { FormCard } from './form-card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

export function EditContentForm({
	contentId,
	initial,
	initialType,
	record,
}: {
	contentId?: string;
	initial?: Partial<any>;
	initialType?: 'Audio' | 'Picture' | 'Video' | 'Written';
	record?: ContentRecord;
}) {
	function normalizePublicData(data: any): any {
		const d = { ...(data ?? {}) } as any;
		// If oneof is not in wrapper form, lift known cases
		const currentCase = (d?.ContentDataOneof?.case ?? undefined) as
			| 'Audio'
			| 'Picture'
			| 'Video'
			| 'Written'
			| undefined;
		if (!currentCase) {
			const candidates: Array<'Audio' | 'Picture' | 'Video' | 'Written'> =
				['Video', 'Written', 'Audio', 'Picture'];
			for (const k of candidates) {
				const v = d?.[k];
				if (v && typeof v === 'object') {
					d.ContentDataOneof = { case: k, value: v } as any;
					break;
				}
			}
		}
		// Clean any stray case props to avoid confusion
		delete d.Video;
		delete d.Written;
		delete d.Audio;
		delete d.Picture;
		return d;
	}
	const resolvedType = ((): 'Audio' | 'Picture' | 'Video' | 'Written' => {
		const caseFromRecord = normalizePublicData(
			(record as any)?.Public?.Data,
		)?.ContentDataOneof?.case as
			| 'Audio'
			| 'Picture'
			| 'Video'
			| 'Written'
			| undefined;
		return caseFromRecord || initialType || 'Video';
	})();

	const resolvedInit = ((): any => {
		if (record) {
			return {
				ContentID: (record.Public as any)?.ContentID ?? contentId ?? '',
				Public: normalizePublicData((record.Public as any)?.Data ?? {}),
				Private: (record.Private as any)?.Data ?? {},
			} as any;
		}
		return {
			ContentID: contentId ?? '',
			Public: {
				ContentDataOneof: ((): any => {
					const c = resolvedType;
					if (c === 'Written')
						return {
							case: 'Written',
							value: create(
								WrittenContentPublicDataSchema,
							) as any,
						};
					if (c === 'Audio')
						return {
							case: 'Audio',
							value: create(AudioContentPublicDataSchema) as any,
						};
					if (c === 'Picture')
						return {
							case: 'Picture',
							value: create(
								PictureContentPublicDataSchema,
							) as any,
						};
					return {
						case: 'Video',
						value: create(VideoContentPublicDataSchema) as any,
					};
				})(),
			},
			Private: {
				ContentDataOneof: { case: resolvedType, value: {} } as any,
			},
			...(initial ?? {}),
		} as any;
	})();

	const form = useProtoAppForm({
		schema: ModifyContentRequestSchema,
		defaultInit: resolvedInit,
		onValidSubmit: async ({ value }) => {
			try {
				const payload = create(
					ModifyContentRequestSchema as any,
					value as any,
				);
				// eslint-disable-next-line no-console

				// TODO: Send Request
				// TODO: Handle Response
				console.log('[EditContentForm] payload', payload);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error('[EditContentForm] failed to build payload', e);
			}
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
			cardTitle='Edit Content'
			cardDescription='Update details, metadata, and body content.'
		>
			<form
				id='edit-content'
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<div className='space-y-8'>
						<section className='space-y-4'>
							<div className='space-y-1'>
								<h3 className='text-base font-semibold'>
									Content ID
								</h3>
								<p className='text-muted-foreground text-sm'>
									This identifier is required to update the
									record.
								</p>
							</div>
							<form.AppField name='ContentID'>
								{(f: any) => (
									<f.TextField
										label={'Content ID'}
										disabled={Boolean(contentId)}
									/>
								)}
							</form.AppField>
						</section>

						<Separator />

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
									const selected = ((current as any) ??
										resolvedType) as
										| 'Video'
										| 'Written'
										| 'Audio'
										| 'Picture';
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
													} else if (
														v === 'Written'
													) {
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
													} else if (
														v === 'Picture'
													) {
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

						{/* Log debugging */}
						<form.Subscribe selector={(s: any) => s?.submitErrors}>
							{(se: any) => {
								try {
									// eslint-disable-next-line no-console
									console.log(
										'[EditContentForm] submitErrors',
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
									console.log(
										'[EditContentForm] errors',
										e,
									);
								} catch {}
								return null;
							}}
						</form.Subscribe>

						<div className='flex items-center justify-end pt-2'>
							<form.CreateButton label='Save Changes' />
						</div>
					</div>
				</form.AppForm>
			</form>
		</FormCard>
	);
}

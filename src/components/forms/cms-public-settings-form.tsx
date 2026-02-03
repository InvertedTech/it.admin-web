'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormCard } from './form-card';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import { v4 as uuidv4 } from 'uuid';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';

import { modifyCmsPublicSettings } from '@/app/actions/settings';
import {
	ModifyCMSPublicDataRequestSchema,
	ChannelRecordSchema,
	CategoryRecordSchema,
} from '@inverted-tech/fragments/Settings';
import { LayoutEnum } from '@inverted-tech/fragments/Content';

type Props = { base?: any };

export function CmsPublicSettingsForm({ base }: Props) {
	const coerceLayout = (v: unknown) =>
		typeof v === 'string'
			? ((LayoutEnum as any)[v] ?? LayoutEnum.List)
			: (v ?? LayoutEnum.List);

	const defaults = base
		? {
				Data: {
					...(base.Data ?? {}),
					DefaultLayout: coerceLayout(base.Data?.DefaultLayout),
					Channels: base.Data?.Channels ?? [],
					Categories: base.Data?.Categories ?? [],
					Menu: base.Data?.Menu ?? {},
				},
			}
		: {
				Data: {
					DefaultLayout: LayoutEnum.List,
					Channels: [],
					Categories: [],
					Menu: {},
				},
			};

	const form = useProtoAppForm({
		schema: ModifyCMSPublicDataRequestSchema,
		defaultValues: create(
			ModifyCMSPublicDataRequestSchema,
			defaults as any,
		),
		onSubmitAsync: async ({ value }) => {
			console.log(value);
			await modifyCmsPublicSettings(value as any);
		},
	});

	React.useEffect(() => {
		const v = (form.state.values as any)?.Data?.DefaultLayout;
		if (typeof v === 'string') {
			form.setFieldValue(
				'Data.DefaultLayout' as any,
				(LayoutEnum as any)[v] ?? LayoutEnum.List,
			);
		}
	}, [form.state.values?.Data?.DefaultLayout]);

	const addChannel = () => {
		const list = (form.state.values?.Data?.Channels ?? []) as any[];
		form.setFieldValue('Data.Channels' as any, [
			...list,
			create(ChannelRecordSchema, {
				ChannelId: uuidv4(),
				UrlStub: `channel-${Math.random().toString(36).slice(2, 8)}`,
			}),
		]);
	};
	const removeChannel = (i: number) => {
		const list = (form.state.values?.Data?.Channels ?? []) as any[];
		form.setFieldValue(
			'Data.Channels' as any,
			list.slice(0, i).concat(list.slice(i + 1)),
		);
	};

	const addCategory = () => {
		const list = (form.state.values?.Data?.Categories ?? []) as any[];
		form.setFieldValue('Data.Categories' as any, [
			...list,
			create(CategoryRecordSchema),
		]);
	};
	const removeCategory = (i: number) => {
		const list = (form.state.values?.Data?.Categories ?? []) as any[];
		form.setFieldValue(
			'Data.Categories' as any,
			list.slice(0, i).concat(list.slice(i + 1)),
		);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className='space-y-6'
		>
			<form.AppForm>
				<form.Subscribe
					selector={(s: any) => s?.submitErrors ?? s?.errors}
				>
					{(errs: any) => <FormSubmitErrors errors={errs} />}
				</form.Subscribe>

				{/* General */}
				<FormCard
					cardTitle='General'
					cardDescription='Overall defaults for the public site.'
				>
					<FieldGroup>
						<form.Subscribe
							selector={(s: any) =>
								s?.values?.Data?.DefaultLayout ??
								LayoutEnum.List
							}
						>
							{(layout: number) => (
								<div>
									<FieldLabel>Default Layout</FieldLabel>
									<Select
										value={String(layout)}
										onValueChange={(v) =>
											form.setFieldValue(
												'Data.DefaultLayout' as any,
												Number(v),
											)
										}
									>
										<SelectTrigger className='w-56'>
											<SelectValue placeholder='Choose a layout' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value={String(LayoutEnum.List)}
											>
												List
											</SelectItem>
											<SelectItem
												value={String(LayoutEnum.Grid)}
											>
												Grid
											</SelectItem>
											<SelectItem
												value={String(
													LayoutEnum.Masonry,
												)}
											>
												Masonry
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Subscribe>
					</FieldGroup>
				</FormCard>

				{/* Menu */}
				<FormCard
					cardTitle='Menu'
					cardDescription='Navigation link labels.'
				>
					<FieldGroup>
						<div className='grid gap-3 md:grid-cols-2'>
							<form.AppField name='Data.Menu.AudioMenuLinkName'>
								{(f) => <f.TextField label='Audio Link Name' />}
							</form.AppField>
							<form.AppField name='Data.Menu.PictureMenuLinkName'>
								{(f) => (
									<f.TextField label='Picture Link Name' />
								)}
							</form.AppField>
							<form.AppField name='Data.Menu.VideoMenuLinkName'>
								{(f) => <f.TextField label='Video Link Name' />}
							</form.AppField>
							<form.AppField name='Data.Menu.WrittenMenuLinkName'>
								{(f) => (
									<f.TextField label='Written Link Name' />
								)}
							</form.AppField>
						</div>
					</FieldGroup>
				</FormCard>

				{/* Channels */}
				<FormCard
					cardTitle='Channels'
					cardDescription='Site sections or external platforms where content appears.'
				>
					<FieldGroup>
						<div className='mb-2 flex items-center justify-between'>
							<FieldLabel>Manage</FieldLabel>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addChannel}
							>
								Add channel
							</Button>
						</div>

						<form.Subscribe
							selector={(s: any) =>
								(s?.values?.Data?.Channels ?? []) as any[]
							}
						>
							{(channels) =>
								channels.length === 0 ? (
									<div className='text-sm text-muted-foreground border rounded p-3'>
										No channels added.
									</div>
								) : (
									channels.map((_: any, i: number) => (
										<div
											key={i}
											className='mb-4 rounded border p-3'
										>
											<div className='mb-2 flex justify-end'>
												<Button
													type='button'
													variant='destructive'
													size='sm'
													onClick={() =>
														removeChannel(i)
													}
												>
													Remove
												</Button>
											</div>

											<div className='grid gap-3 md:grid-cols-2'>
												<form.AppField
													name={`Data.Channels.${i}.ChannelId`}
												>
													{(f) => (
														<f.TextField
															label='Id'
															disabled
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.ParentChannelId`}
												>
													{(f) => (
														<f.TextField
															label='Parent Id'
															disabled
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.DisplayName`}
												>
													{(f) => (
														<f.TextField label='Display Name' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.UrlStub`}
												>
													{(f) => (
														<f.TextField label='Url Stub' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.ImageAssetId`}
												>
													{(f) => (
														<f.ImagePickerField label='Image' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.YoutubeUrl`}
												>
													{(f) => (
														<f.TextField label='YouTube URL' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.RumbleUrl`}
												>
													{(f) => (
														<f.TextField label='Rumble URL' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Channels.${i}.OldChannelId`}
												>
													{(f) => (
														<f.TextField
															label='Old Id'
															disabled
														/>
													)}
												</form.AppField>
											</div>
										</div>
									))
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</FormCard>

				{/* Categories */}
				<FormCard
					cardTitle='Categories'
					cardDescription='Topical groupings used to organize content.'
				>
					<FieldGroup>
						<div className='mb-2 flex items-center justify-between'>
							<FieldLabel>Manage</FieldLabel>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addCategory}
							>
								Add category
							</Button>
						</div>

						<form.Subscribe
							selector={(s: any) =>
								(s?.values?.Data?.Categories ?? []) as any[]
							}
						>
							{(categories) =>
								categories.length === 0 ? (
									<div className='text-sm text-muted-foreground border rounded p-3'>
										No categories added.
									</div>
								) : (
									categories.map((_: any, i: number) => (
										<div
											key={i}
											className='mb-4 rounded border p-3'
										>
											<div className='mb-2 flex justify-end'>
												<Button
													type='button'
													variant='destructive'
													size='sm'
													onClick={() =>
														removeCategory(i)
													}
												>
													Remove
												</Button>
											</div>

											<div className='grid gap-3 md:grid-cols-2'>
												<form.AppField
													name={`Data.Categories.${i}.CategoryId`}
												>
													{(f) => (
														<f.TextField
															label='Id'
															disabled
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Categories.${i}.ParentCategoryId`}
												>
													{(f) => (
														<f.TextField
															label='Parent Id'
															disabled
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Categories.${i}.DisplayName`}
												>
													{(f) => (
														<f.TextField label='Display Name' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Categories.${i}.UrlStub`}
												>
													{(f) => (
														<f.TextField label='Url Stub' />
													)}
												</form.AppField>
												<form.AppField
													name={`Data.Categories.${i}.OldCategoryId`}
												>
													{(f) => (
														<f.TextField
															label='Old Id'
															disabled
														/>
													)}
												</form.AppField>
											</div>
										</div>
									))
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</FormCard>

				{/* Submit bar */}
				<div className='sticky bottom-4 z-10'>
					<div className='rounded-xl border bg-background/80 backdrop-blur p-3 flex justify-end'>
						<form.Subscribe
							selector={(s: any) => !!s?.isSubmitting}
						>
							{(isSubmitting: boolean) => (
								<Button type='submit' disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Spinner className='mr-2' />{' '}
											Saving...
										</>
									) : (
										'Save changes'
									)}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form.AppForm>
		</form>
	);
}

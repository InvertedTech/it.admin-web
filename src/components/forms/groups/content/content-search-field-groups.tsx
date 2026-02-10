import React from 'react';
import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { GetAllContentAdminRequestSchema } from '@inverted-tech/fragments/Content';

type ChannelOption = { ChannelId?: string; DisplayName?: string };
type CategoryOption = { CategoryId?: string; DisplayName?: string };
export const AdminContentFiltersFieldGroup = withFieldGroup({
	defaultValues: create(GetAllContentAdminRequestSchema),
	render: function Render({ group }) {
		const [channels, setChannels] = React.useState<ChannelOption[]>([]);
		const [categories, setCategories] = React.useState<CategoryOption[]>(
			[],
		);
		React.useEffect(() => {
			let mounted = true;
			fetch('/api/cms/channels')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as ChannelOption[])
						: [];
					setChannels(list);
				})
				.catch(() => {
					if (mounted) setChannels([]);
				});
			return () => {
				mounted = false;
			};
		}, []);

		React.useEffect(() => {
			let mounted = true;
			fetch('/api/cms/categories')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as CategoryOption[])
						: [];
					setCategories(list);
				})
				.catch(() => {
					if (mounted) setCategories([]);
				});

			return () => {
				mounted = false;
			};
		}, []);

		const channelOptions = React.useMemo(
			() =>
				channels.map((c) => ({
					ChannelId: String(c.ChannelId ?? ''),
					DisplayName: String(c.DisplayName ?? c.ChannelId ?? ''),
				})),
			[channels],
		);

		const categoryOptions = React.useMemo(
			() =>
				categories.map((c) => ({
					CategoryId: String(c.CategoryId ?? ''),
					DisplayName: String(c.DisplayName ?? ''),
				})),
			[categories],
		);

		return (
			<FieldGroup>
				{/* Hidden PageOffset Field */}
				<group.AppField name='PageOffset'>
					{(f) => <f.HiddenField />}
				</group.AppField>

				<details className='rounded border p-3 [&>summary]:cursor-pointer' open>
					<summary className='text-sm text-muted-foreground'>
						Filters
					</summary>
					<div className='mt-3 space-y-4'>
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
							<div className='lg:col-span-1'>
								<group.AppField name='PageSize'>
									{(f) => (
										<f.PageSizeField
											label='Page Size'
											value={25}
										/>
									)}
								</group.AppField>
							</div>

							<div className='lg:col-span-1'>
								<group.AppField name='SubscriptionSearch.MinimumLevel'>
									{(f) => (
										<f.SubscriptionTierField
											label='Minimum Tier'
											useAmountCents
											includeMaxOption
										/>
									)}
								</group.AppField>
							</div>

							<div className='lg:col-span-1'>
								<group.AppField name='SubscriptionSearch.MaximumLevel'>
									{(f) => (
										<f.SubscriptionTierField
											label='Maximum Tier'
											useAmountCents
											includeMaxOption
										/>
									)}
								</group.AppField>
							</div>

							<div className='space-y-3 lg:col-span-1'>
								<group.AppField name='Deleted'>
									{(f) => (
										<f.SwitchField label='Show Deleted' />
									)}
								</group.AppField>
								<group.AppField name='OnlyLive'>
									{(f) => (
										<f.SwitchField label='Show Unpublished' />
									)}
								</group.AppField>
							</div>
						</div>

						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							<group.AppField name='ChannelId'>
								{(f) => (
									<f.ChannelSelectField
										label='Channel'
										options={channelOptions}
									/>
								)}
							</group.AppField>

							<group.AppField name='CategoryId'>
								{(f) => (
									<f.CategorySelectField
										label='Category'
										options={categoryOptions}
									/>
								)}
							</group.AppField>

							<group.AppField name='ContentType'>
								{(f) => (
									<f.ContentTypeSelectField
										label='Content Type'
										description=''
									/>
								)}
							</group.AppField>
						</div>

						<div className='flex items-center justify-end gap-2 pt-2'>
							<group.ResetButton label='Reset Filters' />
							<div>
								<group.CreateButton label='Apply Filters' />
							</div>
						</div>
					</div>
				</details>
			</FieldGroup>
		);
	},
});

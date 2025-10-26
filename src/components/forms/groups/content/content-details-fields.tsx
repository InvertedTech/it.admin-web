'use client';

import React from 'react';
import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { useStore } from '@tanstack/react-form';

// Group for basic content public details
type ChannelOption = { ChannelId?: string; DisplayName?: string };
type CategoryOption = { CategoryId?: string; DisplayName?: string };

const ContentDetailsFields = withFieldGroup({
	// Keys here define the fields required in the mapping when used
	defaultValues: {
		Title: '',
		Description: '',
		Author: '',
		URL: '',
		FeaturedImageAssetID: '',
		SubscriptionLevel: 0,
		Tags: [] as string[],
		ChannelIds: [] as string[],
		CategoryIds: [] as string[],
	},
	render: function Render({ group }) {
		// Load channels and categories for selectors
		const [channels, setChannels] = React.useState<ChannelOption[]>([]);
		const [categories, setCategories] = React.useState<CategoryOption[]>([]);
		const [loadingChannels, setLoadingChannels] = React.useState<boolean>(true);
		const [loadingCategories, setLoadingCategories] =
			React.useState<boolean>(true);
		React.useEffect(() => {
			let mounted = true;
			setLoadingChannels(true);
			fetch('/api/cms/channels')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as ChannelOption[])
						: [];
					setChannels(list);
					setLoadingChannels(false);
				})
				.catch(() => {
					if (mounted) setLoadingChannels(false);
				});
			setLoadingCategories(true);
			fetch('/api/cms/categories')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as CategoryOption[])
						: [];
					setCategories(list);
					setLoadingCategories(false);
				})
				.catch(() => {
					if (mounted) setLoadingCategories(false);
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
			[channels]
		);
		const categoryOptions = React.useMemo(
			() =>
				categories.map((c) => ({
					CategoryId: String(c.CategoryId ?? ''),
					DisplayName: String(c.DisplayName ?? c.CategoryId ?? ''),
				})),
			[categories]
		);

		// Slug preview next to Title
		return (
			<>
				<group.AppField name="Title">
					{(f) => (
						<div>
							<f.TextField label={'Title'} />
							<group.Subscribe selector={(s: any) => s?.values?.Title}>
								{(title: string) => {
									const slug = slugify(title ?? '');
									return (
										<div className="text-muted-foreground mt-1 text-xs">
											URL: /{slug}
										</div>
									);
								}}
							</group.Subscribe>
						</div>
					)}
				</group.AppField>
				<group.AppField name="Description">
					{(f) => <f.TextField label={'Description'} />}
				</group.AppField>
				<group.AppField name="Author">
					{(f) => <f.TextField label={'Author'} />}
				</group.AppField>
				{/* URL field hidden; preview is shown under Title */}
				<group.AppField name="FeaturedImageAssetID">
					{(f) => <f.ImagePickerField label={'Featured Image'} />}
				</group.AppField>
				<group.AppField name="SubscriptionLevel">
					{(f) => <f.SubscriptionTierField label={'Subscription Tier'} />}
				</group.AppField>
				<group.AppField name="Tags">
					{(f) => <f.MultiSelectField label={'Tags'} />}
				</group.AppField>
				<group.AppField name="ChannelIds">
					{(f) => (
						<f.ChannelMultiSelectField
							label={'Channels'}
							options={channelOptions}
							loading={loadingChannels}
						/>
					)}
				</group.AppField>
				<group.AppField name="CategoryIds">
					{(f) => (
						<f.CategoryMultiSelectField
							label={'Categories'}
							options={categoryOptions}
							loading={loadingCategories}
						/>
					)}
				</group.AppField>
			</>
		);
	},
});

export default ContentDetailsFields;

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

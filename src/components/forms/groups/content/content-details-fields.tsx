'use client';

import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { useStore } from '@tanstack/react-form';

// Group for basic content public details
const ContentDetailsFields = withFieldGroup({
	// Keys here define the fields required in the mapping when used
	defaultValues: {
		Title: '',
		Description: '',
		Author: '',
		URL: '',
		FeaturedImageAssetID: '',
		SubscriptionLevel: 0,
	},
	render: function Render({ group }) {
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

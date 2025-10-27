'use server';

import { getAdminSettings } from '@/app/actions/settings';
import { LayoutEnum } from '@inverted-tech/fragments/Content';
import { CmsPublicSettingsForm } from '@/components/forms/cms-public-settings-form';

export default async function ContentSettingsPage() {
	const { Public } = await getAdminSettings();
	const cms = Public?.CMS;
	console.log(JSON.stringify(cms?.Channels));
	const base = {
		Data: {
			DefaultLayout: cms?.DefaultLayout ?? LayoutEnum.List,
			Channels: cms?.Channels ?? [],
			Categories: cms?.Categories ?? [],
			Menu: cms?.Menu ?? {},
		},
	};

	return (
		<div className='container mx-auto py-8 space-y-6'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Content Settings
				</h1>
				<p className='text-muted-foreground'>
					Manage channels, categories, and menu for the public site.
				</p>
			</div>

			{/* Client form seeded with existing data */}
			<CmsPublicSettingsForm base={base} />
		</div>
	);
}

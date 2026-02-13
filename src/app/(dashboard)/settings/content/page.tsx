'use server';

import { getAdminSettings } from '@/app/actions/settings';
import { LayoutEnum } from '@inverted-tech/fragments/Content';
import { CmsPublicSettingsForm } from '@/components/forms/cms-public-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher } from '@/lib/roleHelpers';

export default async function ContentSettingsPage() {
	// TODO(auth-removal): Remove role/authorization gate.
	await requireRole(isAdminOrHigher);
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
		<div>
			<div className="space-y-1 mb-6">
				<h1 className="text-2xl font-semibold tracking-tight">
					Content Settings
				</h1>
				<p className="text-muted-foreground">
					Manage channels, categories, and menu for the public site.
				</p>
			</div>

			<Tabs defaultValue="public">
				<TabsList>
					<TabsTrigger value="public">Public</TabsTrigger>
					{/* <TabsTrigger value="owner">Owner</TabsTrigger> */}
				</TabsList>
				<TabsContent value="public">
					<CmsPublicSettingsForm base={base} />
				</TabsContent>

				{/* <TabsContent value="owner"></TabsContent> */}
			</Tabs>
		</div>
	);
}

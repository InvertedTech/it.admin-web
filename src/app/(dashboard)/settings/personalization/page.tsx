'use server';

import { getAdminSettings } from '@/app/actions/settings';
import { PersonalizationPublicForm } from '@/components/forms/personalization-public-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher } from '@/lib/roleHelpers';

export default async function SettingsGeneralPersonalizationPage() {
	// TODO(auth-removal): Remove role/authorization gate.
	await requireRole(isAdminOrHigher);
	const { Public } = await getAdminSettings();

	return (
		<div>
			<div className="space-y-1 mb-6">
				<h1 className="text-2xl font-semibold tracking-tight">
					Subscription Settings
				</h1>
				<p className="text-muted-foreground">
					Manage tiers and payment providers.
				</p>
			</div>
			<Tabs defaultValue="public">
				<TabsList>
					<TabsTrigger value="public">Public</TabsTrigger>
				</TabsList>
				<TabsContent value="public">
					<PersonalizationPublicForm data={Public?.Personalization} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

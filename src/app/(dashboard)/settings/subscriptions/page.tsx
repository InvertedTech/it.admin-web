import { getAdminSettings } from '@/app/actions/settings';
import { SubscriptionOwnerSettingsForm } from '@/components/forms/subscription-owner-settings-form';
import { SubscriptionPublicSettingsForm } from '@/components/forms/subscription-public-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function SubscriptionSettingsPage() {
	const { Public, Private } = await getAdminSettings();
	const base = { Data: Public?.Subscription };

	return (
		<div className="space-y-6">
			<div className="space-y-1">
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
					<TabsTrigger value="owner">Owner</TabsTrigger>
				</TabsList>
				<TabsContent value="public">
					<SubscriptionPublicSettingsForm base={base} />
				</TabsContent>

				<TabsContent value="owner">
					<SubscriptionOwnerSettingsForm />
				</TabsContent>
			</Tabs>
		</div>
	);
}

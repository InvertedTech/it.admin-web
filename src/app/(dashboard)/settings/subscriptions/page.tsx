import { getAdminSettings, getOwnerSettings } from '@/app/actions/settings';
import { SubscriptionOwnerSettingsForm } from '@/components/forms/subscription-owner-settings-form';
import { SubscriptionPublicSettingsForm } from '@/components/forms/subscription-public-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher, isOwner } from '@/lib/roleHelpers';
import { getSession } from '@/lib/session';

export default async function SubscriptionSettingsPage() {
	await requireRole(isAdminOrHigher);
	const session = await getSession();
	const roles = session.roles ?? [];
	const showOwner = isOwner(roles);
	const { Public } = await getAdminSettings();
	const owner = showOwner ? await getOwnerSettings().catch(() => undefined) : undefined;
	const base = { Data: Public?.Subscription };
	const ownerBase = { Data: owner?.Owner?.Subscription } as any;

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
					{showOwner ? <TabsTrigger value="owner">Owner</TabsTrigger> : null}
				</TabsList>
				<TabsContent value="public">
					<SubscriptionPublicSettingsForm base={base} />
				</TabsContent>

				{showOwner ? (
					<TabsContent value="owner">
						<SubscriptionOwnerSettingsForm base={ownerBase} />
					</TabsContent>
				) : null}
			</Tabs>
		</div>
	);
}

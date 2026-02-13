import { NotificationsOwnerSettingsForm } from '@/components/forms/notifications-owner-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getOwnerSettings } from '@/app/actions/settings';
import { requireRole } from '@/lib/rbac';
import { isOwner } from '@/lib/roleHelpers';

export default async function SettingsNotificationsPage() {
	// TODO(auth-removal): Remove role/authorization gate.
	await requireRole(isOwner);
	const owner = await getOwnerSettings().catch(() => undefined);
	const base = { Data: owner?.Owner?.Notification } as any;
	return (
		<div>
			<div className="space-y-1 mb-6">
				<h1 className="text-2xl font-semibold tracking-tight">
					Notifications Settings
				</h1>
				<p className="text-muted-foreground">
					Manage Email Provider Notifications
				</p>
			</div>

			<Tabs defaultValue="owner">
				<TabsList>
					<TabsTrigger value="owner">Owner</TabsTrigger>
				</TabsList>
				<TabsContent value="owner">
					<NotificationsOwnerSettingsForm base={base} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventPublicSettingsForm } from '@/components/forms/event-public-settings-form';
import { EventPrivateSettingsForm } from '@/components/forms/event-private-settings-form';
import { EventOwnerSettingsForm } from '@/components/forms/event-owner-settings-form';
import { getAdminSettings } from '@/app/actions/settings';

export default async function SettingsEventsPage() {
	const admin = await getAdminSettings();
	const data = admin?.Public?.Events as any;
	const privateBase = { Data: admin?.Private?.Events } as any;
	return (
		<div>
			<div className="space-y-1 mb-6">
				<h1 className="text-2xl font-semibold tracking-tight">
					Events Settings
				</h1>
				<p className="text-muted-foreground">Manage Event Venues And Tickets</p>
			</div>

			<Tabs defaultValue="public">
				<TabsList>
					<TabsTrigger value="public">Public</TabsTrigger>
					<TabsTrigger value="private">Private</TabsTrigger>
					<TabsTrigger value="owner">Owner</TabsTrigger>
				</TabsList>

				<TabsContent value="public">
					<EventPublicSettingsForm data={data} />
				</TabsContent>

				<TabsContent value="private">
					<EventPrivateSettingsForm base={privateBase} />
				</TabsContent>

				<TabsContent value="owner">
					<EventOwnerSettingsForm />
				</TabsContent>
			</Tabs>
		</div>
	);
}

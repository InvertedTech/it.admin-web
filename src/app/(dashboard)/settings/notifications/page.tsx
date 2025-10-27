import { NotificationsOwnerSettingsForm } from '@/components/forms/notifications-owner-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export default function SettingsNotificationsPage() {
	return (
		<div className="container mx-auto py-8 space-y-6 w-9/10">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Notifications Settings
				</h1>
				<p className="text-muted-foreground">
					Manage Email Provider Notifications
				</p>
			</div>

			<Tabs defaultValue="owner">
				<TabsList>
					{/* <TabsTrigger value="public">Public</TabsTrigger> */}
					<TabsTrigger value="owner">Owner</TabsTrigger>
				</TabsList>
				{/* <TabsContent value="public"></TabsContent> */}

				<TabsContent value="owner">
					<NotificationsOwnerSettingsForm />
				</TabsContent>
			</Tabs>
		</div>
	);
}

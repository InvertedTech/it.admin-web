// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { EventPublicSettingsForm } from '@/components/forms/event-public-settings-form';
// import { EventPrivateSettingsForm } from '@/components/forms/event-private-settings-form';
// import { EventOwnerSettingsForm } from '@/components/forms/event-owner-settings-form';
// import { getAdminSettings, getOwnerSettings } from '@/app/actions/settings';
// import { requireRole } from '@/lib/rbac';
// import { isAdminOrHigher, isOwner } from '@/lib/roleHelpers';
// import { getSession } from '@/lib/session';

import { redirect } from 'next/navigation';

export default async function SettingsEventsPage() {
	// await requireRole(isAdminOrHigher);
	// const session = await getSession();
	// const roles = session.roles ?? [];
	// const showOwner = isOwner(roles);
	// const admin = await getAdminSettings();
	// const owner = showOwner ? await getOwnerSettings().catch(() => undefined) : undefined;
	// const data = admin?.Public?.Events as any;
	// const privateBase = { Data: admin?.Private?.Events } as any;
	// const ownerBase = owner?.Owner?.Events as any;
	// return (
	// 	<div>
	// 		<div className="space-y-1 mb-6">
	// 			<h1 className="text-2xl font-semibold tracking-tight">
	// 				Events Settings
	// 			</h1>
	// 			<p className="text-muted-foreground">Manage Event Venues And Tickets</p>
	// 		</div>

	// 		<Tabs defaultValue="public">
	// 			<TabsList>
	// 				<TabsTrigger value="public">Public</TabsTrigger>
	// 				<TabsTrigger value="private">Private</TabsTrigger>
	// 				{showOwner ? <TabsTrigger value="owner">Owner</TabsTrigger> : null}
	// 			</TabsList>

	// 			<TabsContent value="public">
	// 				<EventPublicSettingsForm data={data} />
	// 			</TabsContent>

	// 			<TabsContent value="private">
	// 				<EventPrivateSettingsForm base={privateBase} />
	// 			</TabsContent>

	// 			{showOwner ? (
	// 				<TabsContent value="owner">
	// 					<EventOwnerSettingsForm base={ownerBase} />
	// 				</TabsContent>
	// 			) : null}
	// 		</Tabs>
	// 	</div>
	// );
	redirect('/');
}

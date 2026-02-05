// import {
// 	CommentsPrivateSettingsForm,
// 	CommentsPublicSettingsForm,
// } from '@/components/forms/comments-settings-forms';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { requireRole } from '@/lib/rbac';
// import { isAdminOrHigher } from '@/lib/roleHelpers';

import { redirect } from 'next/navigation';

export default async function SettingsCommentsPage() {
	// await requireRole(isAdminOrHigher);
	// return (
	// 	<div>
	// 		<div className="space-y-1 mb-6">
	// 			<h1 className="text-2xl font-semibold tracking-tight">
	// 				Comments Settings
	// 			</h1>
	// 			<p className="text-muted-foreground">
	// 				Manage Comment Restrictions and Blacklists
	// 			</p>
	// 		</div>

	// 		<Tabs defaultValue="public">
	// 			<TabsList>
	// 				<TabsTrigger value="public">Public</TabsTrigger>
	// 				<TabsTrigger value="private">Private</TabsTrigger>
	// 			</TabsList>
	// 			<TabsContent value="public">
	// 				<CommentsPublicSettingsForm />
	// 			</TabsContent>

	// 			<TabsContent value="private">
	// 				<CommentsPrivateSettingsForm />
	// 			</TabsContent>
	// 		</Tabs>
	// 	</div>
	// );
	return redirect('/');
}

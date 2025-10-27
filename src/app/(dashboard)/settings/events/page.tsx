import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export default function SettingsEventsPage() {
	return (
		<div className="container mx-auto py-8 space-y-6 w-9/10">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Events Settings
				</h1>
				<p className="text-muted-foreground">Manage Event Venues And Tickets</p>
			</div>

			<Tabs defaultValue="public">
				<TabsList>
					<TabsTrigger value="public">Public</TabsTrigger>
					<TabsTrigger value="owner">Owner</TabsTrigger>
				</TabsList>
				<TabsContent value="public"></TabsContent>

				<TabsContent value="owner"></TabsContent>
			</Tabs>
		</div>
	);
}

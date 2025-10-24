'use server';
import { getAdminSettings } from '@/app/actions/settings';
import { CategoriesTable } from '@/components/tables/categories-table';
import { ChannelsTable } from '@/components/tables/channels-table';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default async function ContentSettingsPage() {
	const { Public } = await getAdminSettings();
	const cms = Public?.CMS;

	// Normalize arrays to avoid undefined access in the UI
	const channels = cms?.Channels ?? [];
	const categories = cms?.Categories ?? [];

	// Prefer server-reported timestamp when available
	let lastUpdated = '—';
	try {
		const seconds = (Public as any)?.ModifiedOnUTC?.seconds;
		if (seconds != null) lastUpdated = new Date(Number(seconds) * 1000).toLocaleString();
		else lastUpdated = new Date().toLocaleString();
	} catch {
		lastUpdated = new Date().toLocaleString();
	}
	return (
		<div className="container mx-auto py-8 space-y-6">
			{/* Page header */}
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Content Settings
				</h1>
				<p className="text-muted-foreground">
					Manage channels and categories that define how your site organizes
					content.
				</p>
			</div>

			{/* Overview */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle>Settings Overview</CardTitle>
					<CardDescription>Snapshot of your content taxonomy.</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Channels</div>
						<div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
							{channels.length} <Badge variant="secondary">total</Badge>
						</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Categories</div>
						<div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
							{categories.length} <Badge variant="secondary">total</Badge>
						</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Last Updated</div>
						<div className="mt-1 text-xl font-medium">{lastUpdated}</div>
					</div>
				</CardContent>
			</Card>

			{/* Two-column responsive grid */}
			<div className="grid grid-cols-1 gap-6 px-5 lg:grid-cols-2">
				{/* Channels Section */}
				<Card className="overflow-hidden pt-3 px-4">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Channels <Badge variant="secondary">{channels.length}</Badge>
						</CardTitle>
						<CardDescription>
							Configure where content is distributed across site sections or
							platforms.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<ChannelsTable data={channels} />
					</CardContent>
				</Card>

				{/* Categories Section */}
				<Card className="overflow-hidden pt-3 px-4">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Categories <Badge variant="secondary">{categories.length}</Badge>
						</CardTitle>
						<CardDescription>
							Define topical groupings and taxonomy for your CMS.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<CategoriesTable data={categories} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

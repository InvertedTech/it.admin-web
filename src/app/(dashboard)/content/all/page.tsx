import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ContentTable } from '@/components/tables/content-table';
import { getContent } from '@/app/actions/content';

export default async function AllContentPage() {
	const data = await getContent();
	return (
		<div className="container mx-auto space-y-6 py-8">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Content</h1>
				<p className="text-muted-foreground">
					Browse, filter, and manage all published and scheduled content.
				</p>
			</div>

			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle>Content List</CardTitle>
					<CardDescription>
						Search by title or author. Toggle columns to customize your view.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<ContentTable data={data.Records} />
				</CardContent>
			</Card>
		</div>
	);
}

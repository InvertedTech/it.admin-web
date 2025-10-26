import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { ContentPublicData } from '@inverted-tech/fragments/Content';

type Props = {
	id: string;
	pubData: ContentPublicData;
};

export function ContentDetails({ id, pubData }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Details</CardTitle>
				<CardDescription>Core metadata about this content.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Content ID</div>
						<div className="mt-1 font-mono text-sm">{id}</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Author</div>
						<div className="mt-1">{pubData?.Author ?? '—'}</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">URL</div>
						<div className="mt-1 break-all">
							{pubData?.URL ? (
								<a
									href={pubData?.URL}
									className="underline underline-offset-2"
									target="_blank"
									rel="noreferrer"
								>
									{pubData?.URL}
								</a>
							) : (
								'—'
							)}
						</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Tags</div>
						<div className="mt-1 flex flex-wrap gap-1">
							{pubData.Tags.length ? (
								pubData.Tags.map((t) => (
									<Badge
										key={String(t)}
										variant="outline"
										className="px-1.5"
									>
										{String(t)}
									</Badge>
								))
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Channels</div>
						<div className="mt-1">{pubData?.ChannelIds.length ?? 0}</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Categories</div>
						<div className="mt-1">{pubData?.CategoryIds.length ?? 0}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

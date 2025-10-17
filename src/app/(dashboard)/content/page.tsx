import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ContentTable,
	ContentListRecord,
} from '@/components/tables/content-table';

async function getContent(): Promise<ContentListRecord[]> {
	// TODO: replace with your API call
	return [
		{
			ContentID: 'cnt_001',
			CreatedOnUTC: '2025-10-01T12:00:00Z',
			PublishOnUTC: '2025-10-05T14:00:00Z',
			PinnedOnUTC: '',
			Title: 'How to wire a CMS with Next.js',
			Description:
				'A practical guide to building a headless CMS frontend.',
			SubscriptionLevel: 0,
			URL: '/content/cnt_001',
			Author: 'Alex Doe',
			AuthorID: 'usr_01',
			FeaturedImageAssetID: 'asset_2001',
			CategoryIds: ['cat_news', 'cat_tech'],
			ChannelIds: ['ch_main'],
			IsLiveStream: false,
			IsLive: false,
			ContentType: 0,
		},
		{
			ContentID: 'cnt_002',
			CreatedOnUTC: '2025-10-07T08:22:00Z',
			PublishOnUTC: '2025-10-08T18:00:00Z',
			PinnedOnUTC: '2025-10-09T00:00:00Z',
			Title: 'Weekly Livestream: Roadmap Q&A',
			Description: 'Live AMA with the team about upcoming features.',
			SubscriptionLevel: 1,
			URL: '/content/cnt_002',
			Author: 'Sam Rivera',
			AuthorID: 'usr_02',
			FeaturedImageAssetID: 'asset_2005',
			CategoryIds: ['cat_news'],
			ChannelIds: ['ch_main', 'ch_members'],
			IsLiveStream: true,
			IsLive: true,
			ContentType: 3,
		},
		{
			ContentID: 'cnt_003',
			CreatedOnUTC: '2025-09-25T10:12:00Z',
			PublishOnUTC: '2025-09-26T10:00:00Z',
			PinnedOnUTC: '',
			Title: 'Interview: Creator Economics',
			Description: 'Podcast episode with special guest.',
			SubscriptionLevel: 2,
			URL: '/content/cnt_003',
			Author: 'Chris Lin',
			AuthorID: 'usr_03',
			FeaturedImageAssetID: '',
			CategoryIds: ['cat_opinion'],
			ChannelIds: ['ch_podcast'],
			IsLiveStream: false,
			IsLive: false,
			ContentType: 2,
		},
	];
}

export default async function ContentListPage() {
	const data = await getContent();
	return (
		<div className='container mx-auto space-y-6 py-8'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Content
				</h1>
				<p className='text-muted-foreground'>
					Browse, filter, and manage all published and scheduled
					content.
				</p>
			</div>

			<Card className='overflow-hidden'>
				<CardHeader>
					<CardTitle>Content List</CardTitle>
					<CardDescription>
						Search by title or author. Toggle columns to customize
						your view.
					</CardDescription>
				</CardHeader>
				<CardContent className='p-0'>
					<ContentTable data={data} />
				</CardContent>
			</Card>
		</div>
	);
}

import { AssetGalleryCard } from '@/components/assets/gallery/AssetGalleryCard';
import { Button } from '@/components/ui/button';
import { searchAssets } from '@/app/actions/assets';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { AssetType } from '@inverted-tech/fragments/Content/AssetInterface_pb';
import type { ImageAssetPublicRecord } from '@inverted-tech/fragments/Content/ImageAssetRecord_pb';

type GalleryItem = {
	type: 'image';
	record: ImageAssetPublicRecord;
	src: string | null;
};

export async function AssetsGallery({
	size = 10,
	offset = 0,
}: {
	size: number;
	offset: number;
}) {
	noStore();
	const imagesRes = await searchAssets({
		AssetType: AssetType.AssetImage,
		PageSize: size,
		PageOffset: offset,
	}, { noCache: true });
	const images = ((imagesRes as any)?.Records ??
		[]) as ImageAssetPublicRecord[];
	const pageTotalItems = Number((imagesRes as any)?.PageTotalItems ?? 0);
	const pageOffsetStart = Number(
		(imagesRes as any)?.PageOffsetStart ?? offset,
	);
	const pageOffsetEnd = Number(
		(imagesRes as any)?.PageOffsetEnd ?? pageOffsetStart + images.length,
	);
	const items: GalleryItem[] = await Promise.all(
		//TODO: improve typing to be more closely related with the record type
		images.map(async (record) => ({
			type: 'image' as const,
			record,
			src: record.Data?.URL ?? '',
		})),
	);

	const apiBaseUrl = (
		process.env.NEXT_PUBLIC_API_BASE_URL ??
		process.env.API_BASE_URL ??
		''
	).replace(/\/+$/, '');
	const hasPrevious = pageOffsetStart > 0;
	const hasNext = pageOffsetEnd < pageTotalItems;
	const previousOffset = Math.max(0, pageOffsetStart - size);
	const nextOffset = pageOffsetStart + size;

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{items.map((item) => (
					<AssetGalleryCard
						key={item.record.AssetID}
						type='image'
						id={item.record.AssetID}
						title={item.record.Data?.Title || 'Image'}
						apiSrcUrl={`${apiBaseUrl}/cms/asset/${item.record.AssetID}/data`}
					/>
				))}
				{items.length === 0 && (
					<div className='text-muted-foreground'>
						No assets found.
					</div>
				)}
			</div>

			{pageTotalItems > size && (
				<div className='flex items-center justify-between gap-4'>
					<p className='text-muted-foreground text-sm'>
						Showing {Math.min(pageOffsetStart + 1, pageTotalItems)}-
						{Math.min(pageOffsetEnd, pageTotalItems)} of{' '}
						{pageTotalItems}
					</p>
					<div className='flex items-center gap-2'>
						{hasPrevious ? (
							<Button asChild variant='outline'>
								<Link
									href={`?PageSize=${size}&PageOffset=${previousOffset}`}
								>
									Previous
								</Link>
							</Button>
						) : (
							<Button disabled variant='outline'>
								Previous
							</Button>
						)}
						{hasNext ? (
							<Button asChild variant='outline'>
								<Link
									href={`?PageSize=${size}&PageOffset=${nextOffset}`}
								>
									Next
								</Link>
							</Button>
						) : (
							<Button disabled variant='outline'>
								Next
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

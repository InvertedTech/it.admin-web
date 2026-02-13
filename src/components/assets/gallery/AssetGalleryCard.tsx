import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageAssetModal } from '../image-asset-modal';

type ImageSizeProps = {
	width: number;
	height: number;
};

type AssetGalleryCardProps = {
	type: 'image' | 'audio';
	id: string;
	title: string;
	apiSrcUrl: string;
	size?: ImageSizeProps;
};

export function AssetGalleryCard({
	id,
	title,
	apiSrcUrl,
	size,
}: AssetGalleryCardProps) {
	return (
		<Card key={id} className='overflow-hidden'>
			<CardHeader>
				<CardTitle className='text-sm font-medium line-clamp-1'>
					{title || 'Untitled'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ImageAssetModal src={apiSrcUrl} title={title || 'Image'} />
				{size && (
					<div className='mt-2 text-xs text-muted-foreground'>
						size.width && size.height ? `${size.width}x$
						{size.height}px` : {'-'}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

'use server';

import { Suspense } from 'react';
import { AssetsGallery } from '@/components/assets/gallery/AssetGallery';
import { UploadAssetButton } from '@/components/assets/upload-asset-button';
import { Skeleton } from '@/components/ui/skeleton';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';

type AssetIndexProps = {
	searchParams: Promise<{
		PageSize?: string | number;
		PageOffset?: string | number;
	}>;
};

function AssetsGalleryFallback() {
	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className='space-y-2'>
						<Skeleton className='aspect-square w-full rounded-md' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				))}
			</div>
			<div className='flex items-center justify-between gap-4'>
				<Skeleton className='h-4 w-40' />
				<div className='flex items-center gap-2'>
					<Skeleton className='h-9 w-20' />
					<Skeleton className='h-9 w-20' />
				</div>
			</div>
		</div>
	);
}

export default async function AssetIndexPage({
	searchParams,
}: AssetIndexProps) {
	const { PageSize = 10, PageOffset = 0 } = await searchParams;
	const pageSize = Number(PageSize) || 10;
	const pageOffset = Number(PageOffset) || 0;
	// TODO(auth-removal): Remove role/authorization gate.
	await requireRole(isWriterOrHigher);

	return (
		<div>
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='space-y-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Assets
					</h1>
					<p className='text-muted-foreground'>
						Browse uploaded assets.
					</p>
				</div>
				<UploadAssetButton />
			</div>

			<Suspense
				key={`${pageSize}-${pageOffset}`}
				fallback={<AssetsGalleryFallback />}
			>
				<AssetsGallery size={pageSize} offset={pageOffset} />
			</Suspense>
		</div>
	);
}

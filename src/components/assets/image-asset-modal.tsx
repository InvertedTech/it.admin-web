'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';

export function ImageAssetModal({
	src,
	title,
}: {
	src: string | null;
	title: string;
}) {
	const [open, setOpen] = React.useState(false);

	if (!src) {
		return (
			<div className="flex h-full items-center justify-center text-xs text-muted-foreground">
				No preview
			</div>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted"
				aria-label={`Open ${title || 'image'} preview`}
			>
				<img src={src} alt={title} className="h-full w-full object-cover" />
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-5xl p-0 overflow-hidden">
					<div className="p-4">
						<DialogTitle>{title || 'Image'}</DialogTitle>
						<DialogDescription>Full size preview.</DialogDescription>
					</div>
					<div className="flex max-h-[80vh] w-full items-center justify-center bg-black">
						<img
							src={src}
							alt={title}
							className="h-auto max-h-[80vh] w-auto max-w-full"
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

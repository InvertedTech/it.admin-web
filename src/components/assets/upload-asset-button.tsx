'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import { NewAssetForm } from '@/components/forms/new-asset-form';

export function UploadAssetButton() {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className="gap-2">
				<Upload className="h-4 w-4" /> Upload asset
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
					<DialogTitle>Upload Asset</DialogTitle>
					<DialogDescription>
						Upload an image or audio file.
					</DialogDescription>
					<NewAssetForm />
				</DialogContent>
			</Dialog>
		</>
	);
}

'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	setOpen: (v: boolean) => void;
};

export function UnsavedDialog({ open, onConfirm, onCancel, setOpen }: Props) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(v) => (v ? setOpen(true) : onCancel())}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes. If you leave, your edits will be lost.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>Stay</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Leave</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

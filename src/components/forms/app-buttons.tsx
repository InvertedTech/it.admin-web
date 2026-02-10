'use client';

import { useStore } from '@tanstack/react-form';
import { UnsavedDialog } from '@/components/layout/nav/unsaved-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFormContext } from '@/hooks/form-context';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';

export function CreateButton({ label = 'Create' }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					disabled={isSubmitting}
				>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

/** Reset to original defaultValues */
export function ResetButton({ label = 'Reset' }: { label?: string }) {
	const form = useFormContext();
	return (
		<Button
			type="button"
			variant="outline"
			onClick={() => form.reset()}
		>
			{label ?? 'Reset'}
		</Button>
	);
}

export function SaveChangesBar({ label = 'Save Changes' }: { label?: string }) {
	const form = useFormContext();
	const { isDirty, isSubmitting } = useStore(form.store as any, (s: any) => ({
		isDirty: !!s?.isDirty,
		isSubmitting: !!s?.isSubmitting,
	}));
	const { dialogOpen, setDialogOpen, confirm, cancel } =
		useUnsavedGuard(isDirty);

	if (!isDirty && !isSubmitting) {
		return (
			<UnsavedDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onCancel={cancel}
				onConfirm={confirm}
			/>
		);
	}

	return (
		<>
			<UnsavedDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onCancel={cancel}
				onConfirm={confirm}
			/>
			<div className="sticky bottom-4 z-10">
				<div className="rounded-xl border bg-background/80 backdrop-blur p-3 flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
						onClick={() => form.reset()}
					>
						Undo changes
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Spinner className="mr-2" /> Saving...
							</>
						) : (
							label
						)}
					</Button>
				</div>
			</div>
		</>
	);
}

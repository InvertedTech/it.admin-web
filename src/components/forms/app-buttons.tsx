'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFormContext } from '@/hooks/form-context';
import { useState } from 'react';

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
	return (
		<div className="sticky bottom-4 z-10">
			<div className="rounded-xl border bg-background/80 backdrop-blur p-3 flex justify-end">
				<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
					{(isSubmitting: boolean) => (
						<Button
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Spinner className="mr-2" /> Saving...
								</>
							) : (
								'Save changes'
							)}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</div>
	);
}

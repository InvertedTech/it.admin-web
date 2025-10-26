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

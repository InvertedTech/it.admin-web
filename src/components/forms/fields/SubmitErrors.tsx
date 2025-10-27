'use client';
import { useFormContext } from '@/hooks/form-context';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';

export function SubmitErrors() {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
			{(errs: any) => <FormSubmitErrors errors={errs} />}
		</form.Subscribe>
	);
}

'use client';
import * as React from 'react';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';

type SettingsFormProps = {
	form: any; // your useProtoAppForm instance
	children: React.ReactNode;
	className?: string;
};

export function SettingsForm({ form, children, className }: SettingsFormProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className={className ?? 'space-y-6'}
		>
			<form.AppForm>
				<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
					{(errs: any) => <FormSubmitErrors errors={errs} />}
				</form.Subscribe>
				{children}
				<form.SaveChangesBar />
			</form.AppForm>
		</form>
	);
}

'use client';
import * as React from 'react';

function read(obj: any, path: string) {
	return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

type ProviderTogglePanelProps = {
	form: any; // useProtoAppForm instance
	enabledField: string; // e.g. "Data.Stripe.Enabled"
	label?: string; // checkbox label
	children: React.ReactNode; // rendered when enabled === true
};

export function ProviderTogglePanel({
	form,
	enabledField,
	label = 'Enabled',
	children,
}: ProviderTogglePanelProps) {
	return (
		<div>
			<div className='flex items-center justify-between'>
				<div className='text-sm text-muted-foreground'>Status</div>
				<div className='min-w-[220px]'>
					<form.AppField name={enabledField as any}>
						{(f: any) => <f.BooleanField label={label} />}
					</form.AppField>
				</div>
			</div>
			<form.Subscribe
				selector={(s: any) => !!read(s?.values, enabledField)}
			>
				{(on: boolean) =>
					on ? (
						<div className='mt-4 grid gap-3'>{children}</div>
					) : null
				}
			</form.Subscribe>
		</div>
	);
}

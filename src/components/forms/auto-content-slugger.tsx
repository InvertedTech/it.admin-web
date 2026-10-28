'use client';

import { buildContentUrl } from '@/lib/slugify';

export function AutoContentSlugger({ form }: { form: any }) {
	return (
		<form.Subscribe selector={(s: any) => s?.values?.Public}>
			{(pub: any) => {
				const url = pub?.URL ?? '';
				const desired = buildContentUrl(
					pub?.Title ?? '',
					pub?.ContentDataOneof?.case as string | undefined,
					pub?.SubscriptionLevel,
				);
				if (
					desired !== url &&
					typeof form?.setFieldValue === 'function'
				) {
					form.setFieldValue('Public.URL', desired);
				}
				return null;
			}}
		</form.Subscribe>
	);
}

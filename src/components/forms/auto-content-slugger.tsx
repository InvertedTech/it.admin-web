'use client';

import { slugify } from '@/lib/slugify';

export function AutoContentSlugger({ form }: { form: any }) {
	return (
		<form.Subscribe selector={(s: any) => s?.values?.Public}>
			{(pub: any) => {
				const title = pub?.Title ?? '';
				const url = pub?.URL ?? '';
				const contentType = pub?.ContentDataOneof?.case as string | undefined;
				const prefix = contentType ? contentType.toLowerCase() : '';
				const slug = slugify(title);
				const desired = prefix && slug ? `${prefix}/${slug}` : slug;
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

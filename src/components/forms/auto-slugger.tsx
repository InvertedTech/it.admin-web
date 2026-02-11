'use client';

import { slugify } from '@/lib/slugify';

type AutoSluggerProps =
	| { form: any; namePath: string; slugPath: string }
	| {
			form: any;
			namePath?: undefined;
			slugPath?: undefined;
	  };

export function AutoSlugger(props: AutoSluggerProps) {
	const form = props.form;
	const namePath = props.namePath ?? 'DisplayName';
	const slugPath = props.slugPath ?? 'UrlStub';

	return (
		<form.Subscribe selector={(s: any) => s?.values}>
			{(values: any) => {
				const name = (readField(form, values, namePath) ?? '') as string;
				const slug = (readField(form, values, slugPath) ?? '') as string;
				const desired = slugify(name);
				if (desired !== slug && typeof form?.setFieldValue === 'function') {
					form.setFieldValue(slugPath, desired);
				}
				return null;
			}}
		</form.Subscribe>
	);
}

function readField(form: any, values: any, path: string) {
	if (form && typeof form.getFieldValue === 'function') {
		return form.getFieldValue(path);
	}
	return getIn(values, path);
}

function getIn(obj: any, path: string) {
	return String(path)
		.split('.')
		.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

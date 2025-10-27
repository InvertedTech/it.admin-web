export function matchFieldErrors(
	fields: Record<string, string | string[]> | undefined,
	fieldName: string
): string[] | undefined {
	if (!fields) return;
	const last = fieldName.split('.').pop() || fieldName;
	const camel = last.charAt(0).toLowerCase() + last.slice(1);
	let msgs: any = fields[fieldName] ?? fields[last] ?? fields[camel];
	if (!msgs) {
		const key = Object.keys(fields).find(
			(k) =>
				k.toLowerCase() === last.toLowerCase() ||
				k.toLowerCase().endsWith('.' + last.toLowerCase())
		);
		if (key) msgs = fields[key];
	}
	return Array.isArray(msgs) ? msgs : msgs ? [msgs] : undefined;
}

export function centsToCurrency(cents: number) {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
	}).format(cents / 100);
}

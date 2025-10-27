// src/components/ui/field/hidden-field.tsx
'use client';
import { useFieldContext } from '@/hooks/form-context';

// Hidden input bound to form state. No label, no errors rendered.
export function HiddenField() {
	const field = useFieldContext<string | number | boolean | undefined>();
	return (
		<input
			type="hidden"
			name={field.name}
			value={field.state.value == null ? '' : String(field.state.value)}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
}

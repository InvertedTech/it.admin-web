'use client';

import React, { useState } from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export function TextField({
	label,
	description,
}: {
	label?: React.ReactNode;
	description?: React.ReactNode;
}) {
	const field = useFieldContext<string | undefined>();
	const errors =
		normalizeFieldErrors(
			(Array.isArray(field.state.meta.errors)
				? (field.state.meta.errors as any)
				: []) as any
		) ?? [];
	const isInvalid = errors.length > 0;

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				value={(field.state.value ?? '') as string}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				autoComplete="off"
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={errors} />}
		</UIField>
	);
}

export function SwitchField({ label }: { label?: React.ReactNode }) {
	const field = useFieldContext<boolean | undefined>();
	const errors =
		normalizeFieldErrors(
			(Array.isArray(field.state.meta.errors)
				? (field.state.meta.errors as any)
				: []) as any
		) ?? [];
	const isInvalid = errors.length > 0;

	return (
		<UIField data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
			<Switch
				id={field.name}
				name={field.name}
				checked={!!field.state.value}
				onCheckedChange={(v) => field.handleChange(!!v)}
				aria-invalid={isInvalid}
			/>
			{isInvalid && <FieldError errors={errors} />}
		</UIField>
	);
}

export function SubmitErrors() {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
			{(errs: any) => <FormSubmitErrors errors={errs} />}
		</form.Subscribe>
	);
}

export function PasswordField({ label }: { label?: React.ReactNode }) {
  const field = useFieldContext<string | undefined>();
  const errors =
    normalizeFieldErrors(
      (Array.isArray(field.state.meta.errors)
        ? (field.state.meta.errors as any)
        : []) as any
    ) ?? [];
  const isInvalid = errors.length > 0;
  const [show, setShow] = useState(false);

  return (
    <UIField data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label ?? field.name}</FieldLabel>
      <div className='relative'>
        <Input
          id={field.name}
          name={field.name}
          type={show ? 'text' : 'password'}
          autoComplete={show ? 'off' : 'current-password'}
          placeholder={show ? '' : '••••••••'}
          value={(field.state.value ?? '') as string}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        <button
          type='button'
          aria-label={show ? 'Hide password' : 'Show password'}
          className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 my-auto inline-flex items-center justify-center rounded p-1'
          onClick={() => setShow((v) => !v)}
        >
          {show ? (
            <EyeOffIcon className='h-4 w-4' />
          ) : (
            <EyeIcon className='h-4 w-4' />
          )}
        </button>
      </div>
      {isInvalid && <FieldError errors={errors} />}
    </UIField>
  );
}

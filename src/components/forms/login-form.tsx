'use client';

import type { CSSProperties } from 'react';

import { useEffect, useRef, useState } from 'react';
import { create } from '@bufbuild/protobuf';
import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { FormCard } from './form-card';
import { loginAction } from '@/app/actions/auth';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
// Use protovalidate with generated protobuf schemas
import { getValidator } from '@inverted-tech/fragments/validation';
import { AuthenticateUserRequestSchema } from '@inverted-tech/fragments/protos/Authentication/UserInterface_pb';

function useProtoValidator() {
	const ref = useRef<Awaited<ReturnType<typeof getValidator>> | null>(null);
	useEffect(() => {
		let mounted = true;
		getValidator().then((v) => {
			if (mounted) ref.current = v;
		});
		return () => {
			mounted = false;
		};
	}, []);
	return ref;
}

function extractViolationMessages(err: unknown): string[] {
	const anyErr = err as any;
	const msgs: string[] = [];
	if (Array.isArray(anyErr?.violations)) {
		for (const v of anyErr.violations) {
			const path =
				v?.fieldPath?.elements
					?.map((e: any) => e?.name)
					.filter(Boolean)
					.join('.') || '';
			msgs.push(
				path
					? `${path}: ${v?.message ?? 'invalid'}`
					: v?.message ?? 'invalid'
			);
		}
	} else if (typeof anyErr?.message === 'string') {
		msgs.push(anyErr.message);
	} else {
		msgs.push('Validation failed');
	}
	return msgs;
}

// Build a map of field -> [messages] from protovalidate violations
function toFieldMessageMap(
	violations: Array<any> | undefined | null
): Map<string, string[]> {
	const byField = new Map<string, string[]>();
	if (!Array.isArray(violations)) return byField;

	for (const v of violations) {
		let key: string | undefined;

		// Common protovalidate shape (TS runtime): v.field is an array of FieldDescriptors
		if (Array.isArray(v?.field) && v.field.length > 0) {
			const last = v.field[v.field.length - 1];
			key = last?.jsonName ?? last?.name ?? last?.localName;
		}

		// Older/alternative shape: fieldPath/elements with { name }
		if (!key) {
			const path =
				((v as any)?.fieldPath?.elements ?? (v as any)?.field?.elements)
					?.map((e: any) => e?.name)
					.filter(Boolean)
					.join('.') || '';
			if (path)
				key = path.split('.')[path.split('.').length - 1] || undefined;
		}

		// Last‑resort inference from message text
		if (!key && typeof v?.message === 'string') {
			const msg = v.message as string;
			if (/password\b/i.test(msg)) key = 'Password';
			else if (/^username\b/i.test(msg) || /user\s*name/i.test(msg))
				key = 'UserName';
		}

		const finalKey = key ?? '_';
		const list = byField.get(finalKey) || [];
		list.push(v?.message ?? 'Invalid');
		byField.set(finalKey, list);
	}

	return byField;
}

export function LoginForm() {
	const validatorRef = useProtoValidator();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
		{}
	);
	const form = useForm({
		defaultValues: {
			UserName: '',
			Password: '',
		},
		onSubmit: async ({ value }) => {
			// Validate using protovalidate against the generated schema
			const validator = validatorRef.current ?? (await getValidator());
			const payload = create(AuthenticateUserRequestSchema, value);
			const validateRes = await validator.validate(
				AuthenticateUserRequestSchema,
				payload
			);

			if (validateRes.kind === 'invalid') {
				const byField = toFieldMessageMap(validateRes.error.violations);
				setFieldErrors(Object.fromEntries(byField));
				// mark fields touched so UI styles apply
				for (const name of ['UserName', 'Password'] as const) {
					form.setFieldMeta(name, (meta: any) => ({
						...meta,
						isTouched: true,
					}));
				}
				return; // block submit on validation errors
			}

			// Clear local errors on valid submission
			setFieldErrors({});
			const result = await loginAction(payload);
			if (!result.ok) {
				console.error(
					result.statusText || result.error || 'Login failed'
				);
				// Surface server-provided message as a global error if available
				const message =
					(result.data as any)?.message ||
					result.error ||
					'Login failed';
				setFieldErrors((prev) => ({ ...prev, _: [message] }));
				return;
			}

			// Redirect only if token was set by the server action
			if ((result as any).tokenSet) {
				return redirect('/');
			}
		},
	});

	return (
		<FormCard cardTitle='Login' cardDescription='Login To Your Account'>
			<form
				id='login-form'
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				{/* Form-level (global) validation errors */}
				{(fieldErrors['_']?.length ?? 0) > 0 && (
					<div role='alert' className='mb-4 text-sm text-red-600'>
						{fieldErrors['_'].map((m, i) => (
							<div key={i}>{m}</div>
						))}
					</div>
				)}
				<FieldGroup>
					<form.Field
						name='UserName'
						children={(field) => {
							const localMsgs = fieldErrors['UserName'] ?? [];
							const mergedErrors = [
								...(Array.isArray(field.state.meta.errors)
									? field.state.meta.errors
									: []),
								...localMsgs.map((m) => ({ message: m })),
							];
							const isInvalid = mergedErrors.length > 0;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Email
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type='text'
										autoComplete='username'
										placeholder='m@example.com'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError errors={mergedErrors} />
									)}
								</Field>
							);
						}}
					/>

					<form.Field
						name='Password'
						children={(field) => {
							const localMsgs = fieldErrors['Password'] ?? [];
							const mergedErrors = [
								...(Array.isArray(field.state.meta.errors)
									? field.state.meta.errors
									: []),
								...localMsgs.map((m) => ({ message: m })),
							];
							const isInvalid = mergedErrors.length > 0;

							return (
								<Field data-invalid={isInvalid}>
									<div className='flex items-center'>
										<FieldLabel htmlFor={field.name}>
											Password
										</FieldLabel>
										<a
											href='#'
											className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
										>
											Forgot your password?
										</a>
									</div>
									<Input
										id={field.name}
										name={field.name}
										type='password'
										autoComplete='current-password'
										placeholder='â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(
												event.target.value
											)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError errors={mergedErrors} />
									)}
								</Field>
							);
						}}
					/>

					{/* <form.Field
            name="MFACode"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>MFA Code</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Optional"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Enter your one-time code if multi-factor authentication is
                    enabled.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          /> */}

					<Field>
						<Button type='submit'>Login</Button>
						<Button variant='outline' type='button'>
							Login with Google
						</Button>
						<FieldDescription className='text-center'>
							Don&apos;t have an account? <a href='#'>Sign up</a>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

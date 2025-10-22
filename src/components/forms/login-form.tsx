'use client';

import type { CSSProperties } from 'react';

import { useEffect, useRef } from 'react';
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
// Use protovalidate with generated protobuf schemas
import { getValidator } from '@inverted-tech/fragments/validation';
import { AuthenticateUserRequest, AuthenticateUserRequestSchema } from '@inverted-tech/fragments/Authentication/index';

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

export function LoginForm() {
	const validatorRef = useProtoValidator();
	const form = useForm({
		defaultValues: {
			UserName: '',
			Password: '',
		},
		onSubmit: async ({ value }) => {
			// Validate using protovalidate against the generated schema
			const validator = validatorRef.current ?? (await getValidator());

			// 0) Local UX guard so errors always show, even if proto rules are missing
			const localMsgs: Record<'UserName' | 'Password', string[]> = {
				UserName: [],
				Password: [],
			};
			// if (!value?.UserName)
			// 	localMsgs.UserName.push('Username is required');
			// if (!value?.Password)
			// 	localMsgs.Password.push('Password is required');
			// if (localMsgs.UserName.length || localMsgs.Password.length) {
			// 	for (const k of ['UserName', 'Password'] as const) {
			// 		if (!localMsgs[k].length) continue;
			// 		form.setFieldMeta(k, (meta: any) => ({
			// 			...meta,
			// 			isTouched: true,
			// 			errors: localMsgs[k].map((m) => ({ message: m })),
			// 		}));
			// 	}
			// 	// inline-only: toast removed
			// 	return; // block submit early when obviously missing values
			// }
			try {
				const msg = create(AuthenticateUserRequestSchema, value);
				const r = await validator.validate(
					AuthenticateUserRequestSchema,
					msg
				);
				if (r?.kind === 'invalid') {
					// Apply field errors for shadcn Field components
					const violations = r.violations || [];
					const byField = new Map<string, string[]>();
					for (const v of violations) {
						const path =
							((v as any)?.fieldPath?.elements ?? (v as any)?.field?.elements)
								?.map((e: any) => e?.name)
								.filter(Boolean)
								.join('.') || '';
						let key = (path || '').split('.')[0] as
							| string
							| undefined;
						// Fallback: try to infer from message prefix when fieldPath missing
						const msg = v?.message ?? '';
						if (!key) {
							if (/^password\b/i.test(msg)) key = 'Password';
							else if (
								/^username\b/i.test(msg) ||
								/user\s*name/i.test(msg)
							)
								key = 'UserName';
						}
						const finalKey = key || '_';
						const list = byField.get(finalKey) || [];
						list.push(msg || 'Invalid');
						byField.set(finalKey, list);
					}
					for (const [name, messages] of byField.entries()) {
						// Only set for known fields in this form to satisfy TS types
						const target = name === '_' ? 'UserName' : name;
						if (target === 'UserName' || target === 'Password') {
							form.setFieldMeta(target, (meta: any) => {
								const prior: Array<{ message?: string }> =
									Array.isArray(meta?.errors)
										? meta.errors
										: [];
								const nextNew = messages.map((m) => ({
									message: m,
								}));
								// simple de-dupe by message text
								const seen = new Set<string | undefined>();
								const combined = [...prior, ...nextNew].filter(
									(e) => {
										const key = e?.message;
										if (seen.has(key)) return false;
										seen.add(key);
										return true;
									}
								);
								return {
									...meta,
									isTouched: true,
									errors: combined,
								};
							});
						}
					}

					// inline-only: mapping applied above; nothing else to do here
					return; // block submit
				}
			} catch (e) {
				const msgs = extractViolationMessages(e);
				// inline-only: toast removed
				console.log(`FAILED: ${msgs}`);
				return; // block submit
			}
			// inline-only: toast removed
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
				<FieldGroup>
					<form.Field
						name='UserName'
						children={(field) => {
							const hasErrors =
								(field.state.meta.errors?.length ?? 0) > 0;
							const isInvalid =
								field.state.meta.isTouched && hasErrors;

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
										<FieldError
											errors={field.state.meta.errors}
										/>
									)}
								</Field>
							);
						}}
					/>

					<form.Field
						name='Password'
						children={(field) => {
							const hasErrors =
								(field.state.meta.errors?.length ?? 0) > 0;
							const isInvalid =
								field.state.meta.isTouched && hasErrors;

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
										<FieldError
											errors={field.state.meta.errors}
										/>
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



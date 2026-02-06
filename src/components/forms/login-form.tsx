'use client';

import * as React from 'react';
import { create } from '@bufbuild/protobuf';

import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { FormCard } from './form-card';
import { loginAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { AuthenticateUserRequestSchema } from '@inverted-tech/fragments/Authentication';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type Props = { from?: string };

export function LoginForm({ from }: Props) {
	const router = useRouter();
	const [useMfa, setUseMfa] = React.useState(false);
	const form = useProtoAppForm({
		schema: AuthenticateUserRequestSchema,
		onSubmitAsync: async ({ value }) => {
			const payload = create(AuthenticateUserRequestSchema, value as any);
			const result = await loginAction(payload);
			if (!result.ok) {
				const message =
					(result as any)?.Error?.Message ||
					(result as any)?.error ||
					'Login failed';
				return { form: message };
			}
			return router.push(from ?? '/');
		},
	});

	// Read directly from form.state for now (no useStore subscription)

	return (
		<FormCard
			cardTitle="Login"
			cardDescription="Login To Your Account"
		>
			<form
				id="login-form"
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					{
						<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
							{(errs: any) => <FormSubmitErrors errors={errs} />}
						</form.Subscribe>
					}
					<FieldGroup>
						<form.AppField
							name="UserName"
							children={(field) => <field.TextField label="Email" />}
						/>

						<form.AppField
							name="Password"
							children={(field) => (
								<div>
									<div className="flex items-center justify-between">
										<span />
										<a
											href="#"
											className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
										>
											Forgot your password?
										</a>
									</div>
									<field.PasswordField label="Password" />
								</div>
							)}
						/>
						<div className="flex items-center gap-2">
							<Switch
								id="use-mfa"
								checked={useMfa}
								onCheckedChange={setUseMfa}
							/>
							<Label htmlFor="use-mfa">MFA Enabled?</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="About MFA"
										className="inline-flex h-5 w-5 items-center justify-center rounded"
										tabIndex={-1}
									>
										<Info
											className="h-4 w-4 text-muted-foreground"
											aria-hidden="true"
										/>
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" align="start">
									Enable if your account requires an authenticator code.
								</TooltipContent>
							</Tooltip>
						</div>

						{useMfa ? (
							<form.AppField
								name="MFACode"
								children={(field) => (
									<field.MFAField
										label="MFA Code"
										description="Code From Your Authenticator "
									/>
								)}
							/>
						) : null}
						<div className="flex flex-col gap-2">
							{
								<form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
									{(isSubmitting: boolean) => (
										<Button
											type="submit"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Spinner className="mr-2" />
													Logging in...
												</>
											) : (
												'Login'
											)}
										</Button>
									)}
								</form.Subscribe>
							}
							<Button
								variant="outline"
								type="button"
								className="border-[#8C8C8C] bg-white text-[#5E5E5E] hover:bg-[#F3F2F1] hover:text-[#323130]"
							>
								<svg
									aria-hidden="true"
									viewBox="0 0 23 23"
									className="size-4"
								>
									<rect
										x="1"
										y="1"
										width="10"
										height="10"
										fill="#F25022"
									/>
									<rect
										x="12"
										y="1"
										width="10"
										height="10"
										fill="#7FBA00"
									/>
									<rect
										x="1"
										y="12"
										width="10"
										height="10"
										fill="#00A4EF"
									/>
									<rect
										x="12"
										y="12"
										width="10"
										height="10"
										fill="#FFB900"
									/>
								</svg>
								Login with Microsoft
							</Button>
						</div>
					</FieldGroup>
				</form.AppForm>
			</form>
		</FormCard>
	);
}

'use client';

import { create } from '@bufbuild/protobuf';

import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';

import { FormCard } from './form-card';
import { loginAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { AuthenticateUserRequestSchema } from '@inverted-tech/fragments/Authentication';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';

type Props = { from?: string };

export function LoginForm({ from }: Props) {
	const router = useRouter();
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
						>
							Login with Google
						</Button>
					</div>
				</FieldGroup>
			</form>
		</FormCard>
	);
}


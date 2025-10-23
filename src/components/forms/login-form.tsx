'use client';

import { create } from '@bufbuild/protobuf';

import { Button } from '@/components/ui/button';
import {  FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { FormCard } from './form-card';
import { FormFieldItem } from './form-field-item';
import { loginAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useProtoForm } from '@/hooks/use-proto-form';
import { AuthenticateUserRequestSchema } from '@inverted-tech/fragments/Authentication';
import { FormSubmitErrors } from '@/components/ui/form-submit-errors';
import { Spinner } from '@/components/ui/spinner';

type Props = { from?: string };

export function LoginForm({ from }: Props) {
  const router = useRouter();
  const form = useProtoForm({
    schema: AuthenticateUserRequestSchema,
    onSubmitAsync: async ({ value }) => {
      const payload = create(AuthenticateUserRequestSchema, value as any);
      const result = await loginAction(payload);
      if (!result.ok) {
        const message = (result as any)?.Error?.Message || (result as any)?.error || 'Login failed';
        return { form: message };
      }
      return router.push(from ?? '/');
    },
  });

  // Read directly from form.state for now (no useStore subscription)

  return (
    <FormCard cardTitle='Login' cardDescription='Login To Your Account'>
      <form
        id='login-form'
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        {(
          <form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
            {(errs: any) => <FormSubmitErrors errors={errs} />}
          </form.Subscribe>
        )}
        <FieldGroup>
          <form.Field
            name='UserName'
            children={(field) => (
              <FormFieldItem field={field} label='Email'>
                <Input
                  id={field.name}
                  name={field.name}
                  type='text'
                  autoComplete='username'
                  placeholder='m@example.com'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </FormFieldItem>
            )}
          />

          <form.Field
            name='Password'
            children={(field) => (
              <FormFieldItem field={field} label='Password'>
                <div className='flex items-center justify-between'>
                  <span />
                  <a href='#' className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type='password'
                  autoComplete='current-password'
                  placeholder='••••••••'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </FormFieldItem>
            )}
          />

          <div className='flex items-center gap-2'>
            {(
              <form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
                {(isSubmitting: boolean) => (
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner className='mr-2' />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
            <Button variant='outline' type='button'>
              Login with Google
            </Button>
          </div>
        </FieldGroup>
      </form>
    </FormCard>
  );
}

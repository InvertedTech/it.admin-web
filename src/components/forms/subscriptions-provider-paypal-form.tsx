"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { FormCard } from "./form-card";
import { FormSubmitErrors } from "@/components/ui/form-submit-errors";
import { Spinner } from "@/components/ui/spinner";
import { modifyPublicSubscriptionSettings } from "@/app/actions/settings";
import { useProtoAppForm } from "@/hooks/use-proto-app-form";
import { PaypalPublicSettingsSchema } from "@inverted-tech/fragments/Authorization/Payment/Paypal/PaypalSettings_pb";

type Props = { base?: any };

export function PaypalProviderForm({ base }: Props) {
  const form = useProtoAppForm({
    schema: PaypalPublicSettingsSchema,
    defaultValues: base?.Paypal,
    onSubmitAsync: async ({ value }) => {
      const merged = { ...(base ?? {}), Paypal: { ...(base?.Paypal ?? {}), ...(value as any) } } as any;
      await modifyPublicSubscriptionSettings({ Data: merged } as any);
    },
  });

  return (
    <FormCard cardTitle="PayPal" cardDescription="Enable PayPal and configure checkout.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
          {(errs: any) => <FormSubmitErrors errors={errs} />}
        </form.Subscribe>}
        <FieldGroup>
          <form.AppField name="Enabled" children={(field) => <field.BooleanField label="Enabled" />} />
          <form.AppField name="Url" children={(field) => <field.TextField label="Checkout URL" />} />
          <form.AppField name="ClientID" children={(field) => <field.TextField label="Client ID" />} />
          <Field className="flex items-center justify-end">
            {
              <form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
                {(isSubmitting: boolean) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (<><Spinner className="mr-2" /> Saving...</>) : 'Save'}
                  </Button>
                )}
              </form.Subscribe>
            }
          </Field>
        </FieldGroup>
      </form>
    </FormCard>
  );
}

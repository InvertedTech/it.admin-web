"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { FormCard } from "./form-card";
import { FormSubmitErrors } from "@/components/ui/form-submit-errors";
import { Spinner } from "@/components/ui/spinner";
import { modifyPublicSubscriptionSettings } from "@/app/actions/settings";
import { useProtoAppForm } from "@/hooks/use-proto-app-form";
import { ManualPaymentPublicSettingsSchema } from "@inverted-tech/fragments/Authorization/Payment/Manual/ManualPaymentSettings_pb";

type Props = { base?: any };

export function ManualProviderForm({ base }: Props) {
  const form = useProtoAppForm({
    schema: ManualPaymentPublicSettingsSchema,
    defaultValues: base?.Manual,
    onSubmitAsync: async ({ value }) => {
      const merged = { ...(base ?? {}), Manual: { ...(base?.Manual ?? {}), ...(value as any) } } as any;
      await modifyPublicSubscriptionSettings({ Data: merged } as any);
    },
  });

  return (
    <FormCard cardTitle="Manual" cardDescription="Enable manual payments.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppForm>
          {<form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
            {(errs: any) => <FormSubmitErrors errors={errs} />}
          </form.Subscribe>}
          <FieldGroup>
            <form.AppField
              name="Enabled"
              children={(field) => <field.BooleanField label="Enabled" />}
            />
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
        </form.AppForm>
      </form>
    </FormCard>
  );
}

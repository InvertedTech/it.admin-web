"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { FormCard } from "./form-card";
import { FormSubmitErrors } from "@/components/ui/form-submit-errors";
import { Spinner } from "@/components/ui/spinner";
import { modifyPublicSubscriptionSettings } from "@/app/actions/settings";
import { useProtoAppForm } from "@/hooks/use-proto-app-form";
import { FortisPublicSettingsSchema } from "@inverted-tech/fragments/Authorization/Payment/Fortis/FortisSettings_pb";

type Props = { base?: any };

export function FortisProviderForm({ base }: Props) {
  const form = useProtoAppForm({
    schema: FortisPublicSettingsSchema,
    defaultValues: base?.Fortis,
    onSubmitAsync: async ({ value }) => {
      const merged = { ...(base ?? {}), Fortis: { ...(base?.Fortis ?? {}), ...(value as any) } } as any;
      await modifyPublicSubscriptionSettings({ Data: merged } as any);
    },
  });

  return (
    <FormCard cardTitle="Fortis" cardDescription="Enable Fortis and test mode.">
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
            <form.AppField name="Enabled" children={(field) => <field.BooleanField label="Enabled" />} />
            <form.AppField name="IsTest" children={(field) => <field.BooleanField label="Test Mode" />} />
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

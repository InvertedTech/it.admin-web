"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { FormCard } from "./form-card";
import { FormSubmitErrors } from "@/components/ui/form-submit-errors";
import { Spinner } from "@/components/ui/spinner";
import { modifyPublicSubscriptionSettings } from "@/app/actions/settings";
import { useAppForm } from "@/hooks/app-form";

type Props = {
  base?: any; // SubscriptionPublicRecord from settings
  initial?: any;
};

export function SubscriptionConstraintsForm({ base, initial }: Props) {
  const form = useAppForm({
    defaultValues: {
      AllowOther: !!base?.AllowOther,
      MinimumAllowed: !!base?.MinimumAllowed,
      MaximumAllowed: !!base?.MaximumAllowed,
    },
    onSubmit: async ({ value }) => {
      const merged = {
        ...(base ?? {}),
        AllowOther: !!value.AllowOther,
        MinimumAllowed: !!value.MinimumAllowed,
        MaximumAllowed: !!value.MaximumAllowed,
      } as any;
      // Debug payload before calling API
      console.log('Submitting subscription constraints', { value, merged });
      await modifyPublicSubscriptionSettings({ Data: merged } as any);
    },
  });

  return (
    <FormCard
      cardTitle="Constraints"
      cardDescription="Control whether custom amounts and bounds are allowed."
    >
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
          <form.AppField
            name="AllowOther"
            children={(field) => <field.BooleanField label="Allow Other" />}
          />
          <form.AppField
            name="MinimumAllowed"
            children={(field) => <field.BooleanField label="Minimum Allowed" />}
          />
          <form.AppField
            name="MaximumAllowed"
            children={(field) => <field.BooleanField label="Maximum Allowed" />}
          />
          <Field className="flex items-center justify-end gap-2">
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

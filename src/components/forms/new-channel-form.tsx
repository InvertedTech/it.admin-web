'use client';

import type { CSSProperties } from 'react'
import { useState } from 'react'

import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { FormCard } from './form-card'
import { createChannel } from '@/app/actions/settings'
import { FormSubmitErrors } from '@/components/ui/form-submit-errors'
import { Spinner } from '@/components/ui/spinner'
import { useAppForm } from '@/hooks/app-form'
import { useFieldContext } from '@/hooks/form-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError, FieldLabel } from '@/components/ui/field'
import { normalizeFieldErrors } from '@/hooks/use-proto-validation'
import { ImagePickerField } from './fields/image-picker-field'

// TODO: Replace Zod with generated req/res schemas from @inverted-tech/fragments/schemas
const CreateChannelRequestSchema = z.object({
  DisplayName: z.string().nonempty("DisplayName must not be empty"),
  UrlStub: z.string().nonempty("UrlStub must not be empty"),
  ImageAssetId: z.string().optional(),
  YoutubeUrl: z.string().optional(),
  RumbleUrl: z.string().optional(),
  ParentChannelId: z.string().optional(),
  OldChannelId: z.string().optional(),
})
type ChannelOption = { ChannelId?: string; DisplayName?: string };

function ParentChannelSelect({ options }: { options: ChannelOption[] }) {
  const field = useFieldContext<string | undefined>();
  const errors = normalizeFieldErrors(
    (Array.isArray(field.state.meta.errors)
      ? (field.state.meta.errors as any)
      : []) as any
  );
  const isInvalid = (errors?.length ?? 0) > 0;
  const current = (field.state.value ?? '').trim();
  const selectValue = current === '' ? 'none' : current;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Parent Channel</FieldLabel>
      <Select
        value={selectValue}
        onValueChange={(v) => field.handleChange(v === 'none' ? '' : v)}
      >
        <SelectTrigger aria-invalid={isInvalid}>
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.ChannelId ?? ''} value={o.ChannelId ?? ''}>
              {o.DisplayName ?? o.ChannelId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

export function NewChannelForm({ channels = [] }: { channels?: ChannelOption[] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const form = useAppForm({
    defaultValues: {
      DisplayName: '',
      UrlStub: '',
      ImageAssetId: '',
      YoutubeUrl: '',
      RumbleUrl: '',
      ParentChannelId: '',
      OldChannelId: '',
    } as Record<string, any>,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const parsed = CreateChannelRequestSchema.safeParse(value);
        if (!parsed.success) {
          const fields: Record<string, string | string[]> = {};
          for (const issue of parsed.error.issues) {
            const key = (issue.path?.[0] as string) ?? '_';
            const msg = issue.message;
            if (!fields[key]) fields[key] = msg;
            else fields[key] = Array.isArray(fields[key])
              ? [...(fields[key] as string[]), msg]
              : [fields[key] as string, msg];
          }
          return { form: 'Invalid data', fields } as const;
        }
        const ok = await createChannel(parsed.data as any);
        if (!ok) {
          return { form: 'Failed to create channel' } as const;
        }
        toast('Channel created', {
          description: (
            <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
              <code>{JSON.stringify(parsed.data, null, 2)}</code>
            </pre>
          ),
          position: 'bottom-right',
          classNames: { content: 'flex flex-col gap-2' },
          style: { '--border-radius': 'calc(var(--radius)  + 4px)' } as CSSProperties,
        });
        return;
      },
    },
  });

  return (
    <FormCard
      cardTitle="Create A Channel"
      cardDescription="Define the basics for your new channel."
    >
      <form
        id="new-channel-form"
        onSubmit={(event) => {
          event.preventDefault();
          // Prevent early submit on step 1; advance instead
          if (step === 1) {
            setStep(2);
            return;
          }
          form.handleSubmit();
        }}
      >
        {
          <form.Subscribe selector={(s: any) => s?.submitErrors ?? s?.errors}>
            {(errs: any) => <FormSubmitErrors errors={errs} />}
          </form.Subscribe>
        }
        <Wizard channels={channels} form={form} step={step} setStep={setStep} />
      </form>
    </FormCard>
  )
}

function Wizard({ channels, form, step, setStep }: { channels: ChannelOption[]; form: any; step: 1 | 2; setStep: (s: 1 | 2) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Step {step} of 2</div>
      {step === 1 ? (
        <StepOne channels={channels} form={form} />
      ) : (
        <StepTwo form={form} />
      )}

      <Field className="flex items-center justify-between">
        {step === 1 ? (
          <Button type="reset" variant="outline">Cancel</Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
        )}
        {step === 1 ? (
          <form.Subscribe selector={(s: any) => s?.values}>
            {(values: any) => {
              const canNext = !!(values?.DisplayName && values?.UrlStub);
              return (
                <Button type="button" onClick={() => setStep(2)} disabled={!canNext}>
                  Next
                </Button>
              );
            }}
          </form.Subscribe>
        ) : (
          <form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
            {(isSubmitting: boolean) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (<><Spinner className="mr-2" /> Creating...</>) : 'Create Channel'}
              </Button>
            )}
          </form.Subscribe>
        )}
      </Field>
    </div>
  );
}

function StepOne({ channels, form }: { channels: ChannelOption[]; form: any }) {
  return (
    <>
      <AutoSlugger form={form} />
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <form.AppField
            name="DisplayName"
            children={(field) => (
              <field.TextField label="Display Name" description="The public name viewers will see for this channel." />
            )}
          />
        </div>
        <div className="md:col-span-1">
          <form.AppField
            name="UrlStub"
            children={(field) => (
              <field.TextField label="URL Stub" description="Auto-generated from Display Name." disabled />
            )}
          />
        </div>
        <div className="md:col-span-2">
          <form.AppField
            name="ParentChannelId"
            children={() => <ParentChannelSelect options={channels} />}
          />
        </div>
      </FieldGroup>
    </>
  );
}

function StepTwo({ form }: { form: any }) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <form.AppField name="ImageAssetId" children={() => <ImagePickerField label="Channel Image" />} />
          </div>
      <div className="md:col-span-1">
        <form.AppField
          name="YoutubeUrl"
          children={(field) => (
            <field.TextField label="YouTube URL" />
          )}
        />
      </div>
      <div className="md:col-span-1">
        <form.AppField
          name="RumbleUrl"
          children={(field) => (
            <field.TextField label="Rumble URL" />
          )}
        />
      </div>
      <div className="md:col-span-2">
        <form.AppField
          name="OldChannelId"
          children={(field) => (
            <field.TextField label="Old Channel ID" />
          )}
        />
      </div>
    </FieldGroup>
  );
}

function AutoSlugger({ form }: { form: any }) {
  // Subscribe to values and coerce UrlStub based on DisplayName and sanitation rules
  return (
    <form.Subscribe selector={(s: any) => s?.values}>
      {(values: any) => {
        const name = (values?.DisplayName ?? '') as string;
        const stub = (values?.UrlStub ?? '') as string;
        // Always sync stub to the slugified DisplayName for a locked field
        if (typeof form?.setFieldValue === 'function') {
          const desired = slugify(name);
          if (desired !== stub) form.setFieldValue('UrlStub', desired);
        }
        return null;
      }}
    </form.Subscribe>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[']/g, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

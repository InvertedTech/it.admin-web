'use client';

import type { CSSProperties } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { FormCard } from './form-card'
import { createCategory } from '@/app/actions/settings'
import { FormSubmitErrors } from '@/components/ui/form-submit-errors'
import { Spinner } from '@/components/ui/spinner'
import { useAppForm } from '@/hooks/app-form'
import { useFieldContext } from '@/hooks/form-context'
import { FieldLabel, FieldError } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { normalizeFieldErrors } from '@/hooks/use-proto-validation'

// TODO: Replace Zod with generated req/res schemas from @inverted-tech/fragments/schemas
const NewCategorySchema = z.object({
  DisplayName: z.string().nonempty('DisplayName must not be empty'),
  UrlStub: z.string().nonempty('UrlStub must not be empty'),
  ParentCategoryId: z.string().optional(),
})

type CategoryOption = { CategoryId?: string; DisplayName?: string };

function ParentCategorySelect({ options }: { options: CategoryOption[] }) {
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
      <FieldLabel htmlFor={field.name}>Parent Category</FieldLabel>
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
            <SelectItem key={o.CategoryId ?? ''} value={o.CategoryId ?? ''}>
              {o.DisplayName ?? o.CategoryId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

export function NewCategoryForm({ categories = [] }: { categories?: CategoryOption[] }) {
  const form = useAppForm({
    defaultValues: {
      DisplayName: '',
      UrlStub: '',
      ParentCategoryId: '',
    } as Record<string, any>,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const parsed = NewCategorySchema.safeParse(value);
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
        const ok = await createCategory(parsed.data as any);
        if (!ok) {
          return { form: 'Failed to create category' } as const;
        }
        toast('Category created', {
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
    <FormCard cardTitle="Create Category" cardDescription="Create a new category for your content.">
      <form
        id="create-category-form"
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

          <AutoSlugger form={form} />

          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-1">
              <form.AppField
                name="DisplayName"
                children={(field: any) => (
                  <field.TextField label="Display Name" description="Shown anywhere this category appears in the UI." />
                )}
              />
            </div>
            <div className="md:col-span-1">
              <form.AppField
                name="UrlStub"
                children={(field: any) => (
                  <field.TextField label="URL Stub" description="Auto-generated from Display Name." disabled />
                )}
              />
            </div>
            <div className="md:col-span-2">
              <form.AppField
                name="ParentCategoryId"
                children={() => <ParentCategorySelect options={categories} />}
              />
            </div>
            <Field className="md:col-span-2 flex items-center justify-between">
              <Button type="reset" variant="outline">Cancel</Button>
              {
                <form.Subscribe selector={(s: any) => !!s?.isSubmitting}>
                  {(isSubmitting: boolean) => (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (<><Spinner className="mr-2" /> Creating...</>) : 'Create Category'}
                    </Button>
                  )}
                </form.Subscribe>
              }
            </Field>
          </FieldGroup>
        </form.AppForm>
      </form>
    </FormCard>
  )
}

function AutoSlugger({ form }: { form: any }) {
  return (
    <form.Subscribe selector={(s: any) => s?.values}>
      {(values: any) => {
        const name = (values?.DisplayName ?? '') as string;
        const stub = (values?.UrlStub ?? '') as string;
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

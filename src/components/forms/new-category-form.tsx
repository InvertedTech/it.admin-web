'use client';

import type { CSSProperties } from "react"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { FormCard } from "./form-card"

// TODO: Replace Zod with generated req/res schemas from @inverted-tech/fragments/schemas
const NewCategorySchema = z.object({
  DisplayName: z.string().nonempty("DisplayName must not be empty"),
  UrlStub: z.string().nonempty("UrlStub must not be empty"),
  ParentCategoryId: z.string().optional(),
})

export function NewCategoryForm() {
  const form = useForm({
    defaultValues: {
      DisplayName: "",
      UrlStub: "",
    },
    validators: {
      onSubmit: NewCategorySchema,
    },
    onSubmit: async ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as CSSProperties,
      })
    },
  })

  return (
    <FormCard cardTitle="Create Category" cardDescription="Create A New Category For Your Content">
      <form
        id="create-category-form"
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="DisplayName"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Investing"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Shown anywhere this category appears in the UI.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="UrlStub"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>URL Stub</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="investing"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Used to build the category URL, e.g. `/categories/investing`.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <Field>
            <Button type="submit">Create Category</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FormCard>
  )
}

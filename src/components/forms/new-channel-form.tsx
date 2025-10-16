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
const CreateChannelRequestSchema = z.object({
  DisplayName: z.string().nonempty("DisplayName must not be empty"),
  UrlStub: z.string().nonempty("UrlStub must not be empty"),
  ImageAssetId: z.string().optional(),
  YoutubeUrl: z.string().optional(),
  RumbleUrl: z.string().optional(),
  ParentChannelId: z.string().optional(),
})

export function NewChannelForm() {
  const form = useForm({
    defaultValues: {
      DisplayName: "",
      UrlStub: ""
    },
    validators: {
      onSubmit: CreateChannelRequestSchema,
    },
    onSubmit: async ({ value }) => {

      toast("Channel details submitted:", {
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
    <FormCard
      cardTitle="Create A Channel"
      cardDescription="Define the basics for your new channel."
    >
      <form
        id="new-channel-form"
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
                    placeholder="Acme Broadcast"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    The public name viewers will see for this channel.
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
                    placeholder="acme-broadcast"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Used to build the channel URL, e.g. `/channels/acme-broadcast`.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/* <form.Field
            name="ImageAssetId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Image Asset ID</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Optional asset identifier"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="YoutubeUrl"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>YouTube URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="RumbleUrl"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Rumble URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    placeholder="https://rumble.com/..."
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="ParentChannelId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Parent Channel ID</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Optional parent channel"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          /> */}

          <Field>
            <Button type="submit">Create Channel</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FormCard>
  )
}

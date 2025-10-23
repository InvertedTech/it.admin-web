"use client";

import React from "react";
import { Field as UIField, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { normalizeFieldErrors } from "@/hooks/use-proto-validation";

type Props = {
  field: any; // TanStack React Form field render-prop object
  label?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode; // The actual control (Input, Switch, etc.)
  orientation?: "vertical" | "horizontal" | "responsive";
  // When true, force invalid styling regardless of field errors
  forceInvalid?: boolean;
  // Control whether error messages render; default true
  showErrors?: boolean;
};

export function FormFieldItem({ field, label, description, children, orientation = "vertical", forceInvalid = false, showErrors = true }: Props) {
  const errors = normalizeFieldErrors(
    (Array.isArray(field?.state?.meta?.errors) ? (field.state.meta.errors as any) : []) as any
  ) ?? [];
  const isInvalid = forceInvalid || errors.length > 0;

  return (
    <UIField data-invalid={isInvalid} orientation={orientation}>
      {label !== undefined ? (
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      ) : (
        <FieldLabel htmlFor={field.name}>{field.name}</FieldLabel>
      )}
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {showErrors && errors.length > 0 && <FieldError errors={errors} />}
    </UIField>
  );
}

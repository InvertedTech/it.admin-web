"use client";

import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";
import { TextField, SwitchField, SubmitErrors, PasswordField } from "@/components/forms/app-fields";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SwitchField,
    PasswordField,
  },
  formComponents: {
    SubmitErrors,
  },
});

"use client";

import { useForm } from "@tanstack/react-form";
import { create } from "@bufbuild/protobuf";
import { getValidator } from "@inverted-tech/fragments/validation";
import { useProtoValidator, violationsToTanStackErrors } from "./use-proto-validation";

type SubmitResult =
  | void
  | {
      form?: string | string[];
      fields?: Record<string, string | string[]>;
    };

export type UseProtoFormOptions<TSchema, TValues extends Record<string, any>> = {
  schema: TSchema;
  // Provide either a fully-resolved default object, or an init used with create(schema, init)
  defaultValues?: TValues;
  defaultInit?: Partial<TValues>;
  // If provided, runs after client validation and may return submit errors
  onSubmitAsync?: (args: { value: TValues; formApi: any }) => Promise<SubmitResult>;
  // Optional side-effect callback for successful submits
  onValidSubmit?: (args: { value: TValues; formApi: any }) => Promise<void> | void;
  mapViolations?: (violations: any[] | undefined | null) => SubmitResult;
};

export function useProtoForm<TSchema, TValues extends Record<string, any>>(
  opts: UseProtoFormOptions<TSchema, TValues>
) {
  const { schema, defaultValues, defaultInit, onValidSubmit, onSubmitAsync, mapViolations } = opts;
  const validatorRef = useProtoValidator();

  const resolvedDefaults = ((): TValues => {
    if (defaultValues) return defaultValues as TValues;
    if (defaultInit) return create(schema as any, defaultInit as any) as unknown as TValues;
    return create(schema as any) as unknown as TValues;
  })();

  const form = useForm({
    defaultValues: resolvedDefaults as TValues,
    validators: {
      onSubmitAsync: async ({ value, formApi }) => {
        const validator = validatorRef.current ?? (await getValidator());
        const payload = create(schema as any, value as any);
        const res = await validator.validate(schema as any, payload);

        if (res.kind === "invalid") {
          return mapViolations
            ? mapViolations((res as any).violations)
            : violationsToTanStackErrors((res as any).violations);
        }

        if (res.kind === "error") {
          const msg = (res as any)?.error?.message ?? "Validation error";
          return { form: msg };
        }

        // Valid on client: optionally perform async submit and bubble any server errors
        if (onSubmitAsync) {
          return await onSubmitAsync({ value: value as TValues, formApi });
        }

        return;
      },
    },
    onSubmit: async (ctx) => {
      await onValidSubmit?.({ value: ctx.value as TValues, formApi: ctx.formApi });
    },
  });

  return form;
}

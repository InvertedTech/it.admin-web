"use client";

import { create } from "@bufbuild/protobuf";
import { getValidator } from "@inverted-tech/fragments/validation";
import { useAppForm } from "@/hooks/app-form";
import { violationsToTanStackErrors } from "@/hooks/use-proto-validation";

type SubmitResult =
  | void
  | {
      form?: string | string[];
      fields?: Record<string, string | string[]>;
    };

export function useProtoAppForm<TSchema, TValues extends Record<string, any>>({
  schema,
  defaultValues,
  defaultInit,
  onValidSubmit,
  onSubmitAsync,
  mapViolations,
}: {
  schema: TSchema;
  defaultValues?: TValues;
  defaultInit?: Partial<TValues>;
  onValidSubmit?: (args: { value: TValues; formApi: any }) => Promise<void> | void;
  onSubmitAsync?: (args: { value: TValues; formApi: any }) => Promise<SubmitResult | void>;
  mapViolations?: (violations: any[] | undefined | null) => SubmitResult;
}) {
  const resolvedDefaults = ((): TValues => {
    if (defaultValues) return defaultValues as TValues;
    if (defaultInit) return create(schema as any, defaultInit as any) as unknown as TValues;
    return create(schema as any) as unknown as TValues;
  })();

  const form = useAppForm({
    defaultValues: resolvedDefaults as any,
    validators: {
      onSubmitAsync: async ({ value, formApi }) => {
        const validator = await getValidator();
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

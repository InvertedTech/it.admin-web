"use client";

import { useEffect, useRef } from "react";
import { getValidator } from "@inverted-tech/fragments/validation";

// Load and memoize the protovalidate validator once per app lifecycle
export function useProtoValidator() {
  const ref = useRef<Awaited<ReturnType<typeof getValidator>> | null>(null);
  useEffect(() => {
    let mounted = true;
    getValidator().then((v) => {
      if (mounted) ref.current = v;
    });
    return () => {
      mounted = false;
    };
  }, []);
  return ref;
}

// Build a map of field -> [messages] from protovalidate violations
export function toFieldMessageMap(
  violations: Array<any> | undefined | null
): Map<string, string[]> {
  const byField = new Map<string, string[]>();
  if (!Array.isArray(violations)) return byField;

  const getPart = (p: any): string | undefined =>
    p?.name ?? p?.localName ?? p?.jsonName ?? undefined;

  for (const v of violations) {
    let path: string | undefined;

    // Preferred: v.field is an array of descriptors → join all parts
    if (Array.isArray(v?.field) && v.field.length > 0) {
      const parts = v.field.map(getPart).filter(Boolean) as string[];
      if (parts.length) path = parts.join(".");
    }

    // Alternative: fieldPath.elements with { name }
    if (!path) {
      const parts = ((v as any)?.fieldPath?.elements ?? (v as any)?.field?.elements)
        ?.map((e: any) => e?.name)
        ?.filter(Boolean);
      if (Array.isArray(parts) && parts.length) path = parts.join(".");
    }

    // Fallbacks for common terms when no structured path is present
    if (!path && typeof v?.message === "string") {
      const msg = v.message as string;
      if (/password\b/i.test(msg)) path = "Password";
      else if (/^username\b/i.test(msg) || /user\s*name/i.test(msg)) path = "UserName";
    }

    const key = path ?? "_";
    const message = v?.message ?? "Invalid";

    const add = (k: string) => {
      const list = byField.get(k) || [];
      list.push(message);
      byField.set(k, list);
    };

    // Always add the full path
    add(key);

    // Also add convenient aliases so field components can match by name
    const last = key.split('.').pop() || key;
    if (last && last !== key) add(last);
    const camel = last ? last.charAt(0).toLowerCase() + last.slice(1) : last;
    if (camel && camel !== last) add(camel);
  }

  return byField;
}

// Convert violations to TanStack Form submission error shape
export function violationsToTanStackErrors(violations: Array<any> | null | undefined) {
  const byField = toFieldMessageMap(violations);
  const fields: Record<string, string | string[]> = {};
  const formMsgs: string[] = [];

  for (const [key, msgs] of byField) {
    if (key === "_" || !key) {
      formMsgs.push(...msgs);
      continue;
    }
    fields[key] = msgs.length <= 1 ? msgs[0] : msgs;
  }

  return {
    form: formMsgs.length ? formMsgs : "Invalid data",
    fields,
  } as const;
}

// Normalize a variety of error array types into FieldError-compatible objects
export function normalizeFieldErrors(
  errors?: Array<{ message?: string } | string | undefined>
): Array<{ message?: string } | undefined> | undefined {
  if (!errors) return errors as any;
  return errors.map((m) => (typeof m === "string" ? { message: m } : m));
}


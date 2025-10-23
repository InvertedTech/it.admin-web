"use client";

import React from "react";

type ErrorInput =
  | string
  | string[]
  | { form?: string | string[] }
  | Array<string | { form?: string | string[] } | undefined>;

type Props = {
  errors?: ErrorInput;
  className?: string;
};

function toMessageList(input?: ErrorInput): string[] {
  if (!input) return [];
  const out: string[] = [];

  const push = (val: unknown) => {
    if (!val) return;
    if (Array.isArray(val)) {
      for (const v of val) push(v);
      return;
    }
    if (typeof val === "string") {
      out.push(val);
      return;
    }
    if (typeof val === "object") {
      const anyVal = val as any;
      if (anyVal?.form) push(anyVal.form);
      return;
    }
  };

  push(input);
  return out;
}

export function FormSubmitErrors({ errors, className }: Props) {
  const list = toMessageList(errors);
  if (list.length === 0) return null;
  return (
    <div role="alert" className={className ?? "mb-4 text-sm text-red-600"}>
      {list.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
}

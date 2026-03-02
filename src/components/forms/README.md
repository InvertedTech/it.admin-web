# Proto App Form System

This project uses a layered form system built on **TanStack Form** with **protovalidate** schema validation from Protobuf schemas.

---

## Architecture Overview

```
useProtoAppForm(schema, ...)
  └─ useAppForm(...)                        ← TanStack Form + bound field/form components
       └─ createFormHook(fieldContext, ...) ← form-context.ts
            └─ @tanstack/react-form
```

### Layer 1 — Form Context (`src/hooks/form-context.ts`)

Creates the shared React contexts TanStack Form uses to wire `form.Subscribe`, `useFieldContext()`, and `useFormContext()` together.

```ts
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();
```

### Layer 2 — `useAppForm` (`src/hooks/app-form.ts`)

Calls `createFormHook()` with all field and form components registered. This is what gives `form.AppField`, `form.AppForm`, `form.TextField`, etc. their types.

- **Field components** — `TextField`, `TextAreaField`, `SwitchField`, `TextListField`, etc.
- **Form components** — `SubmitErrors`, `CreateButton`, `ResetButton`, `SaveChangesBar`
- Also exports `withForm` and `withFieldGroup` helpers (see Field Groups below).

You can use `useAppForm` directly when you don't need proto validation (e.g. the `AddDeliverableDialog` inside `WeeklyDeliverablesList`).

### Layer 3 — `useProtoAppForm` (`src/hooks/use-proto-app-form.ts`)

The main hook for forms backed by a Protobuf schema. Wraps `useAppForm` and adds a `validators.onSubmitAsync` that:

1. Creates a proto message from current form values (`create(schema, value)`)
2. Runs `normalizeBeforeValidate(value)` if provided (strip server-managed fields, etc.)
3. Calls `getValidator().validate(schema, payload)` — the protovalidate validator
4. Filters out known false-positive violations (e.g. URL-as-URI rules)
5. Maps remaining violations → TanStack error shape via `violationsToTanStackErrors()` or your custom `mapViolations()`
6. Runs manual group validations (e.g. Video content requiring Rumble/YouTube IDs)
7. Only calls `onSubmitAsync` (your server action) if validation passed (no errors)

---

## `useProtoAppForm` Options

```ts
useProtoAppForm({
  schema,                   // Protobuf MessageSchema (e.g. CareerRecordSchema)
  defaultValues?,           // Pre-built proto message (use create(Schema, data))
  defaultInit?,             // Partial init — hook calls create(schema, defaultInit) for you
  onSubmitAsync?,           // Called after validation passes; return { form, fields } on error
  onValidSubmit?,           // Called by TanStack's onSubmit (after full pipeline)
  normalizeBeforeValidate?, // Strip/transform values before they hit the validator
  mapViolations?,           // Override default violation → error mapping
  onValidatorError?,        // 'report' (default) | 'ignore' — what to do if validator throws
  disableValidation?,       // Skip proto validation entirely (boolean, default false)
})
```

### Two submit callbacks

| Callback | When called | Return value |
|---|---|---|
| `onSubmitAsync` | After proto validation passes | `{ form?, fields? }` on error, `void` on success |
| `onValidSubmit` | TanStack's `onSubmit` (after full pipeline) | `void` only |

Most forms use `onSubmitAsync`. Use `onValidSubmit` when you want TanStack to own the success/error flow.

### `normalizeBeforeValidate`

Use to strip fields that would cause the proto validator to error — typically server-managed timestamps:

```ts
normalizeBeforeValidate: (value) => {
  const { CreatedOnUTC, ModifiedOnUTC, DeletedOnUTC, ...rest } = value as any;
  return rest as typeof value;
},
```

### `mapViolations`

Override error mapping when a proto violation targets a parent message but you need to show it on a child field:

```ts
mapViolations: (violations) => {
  const result = violationsToTanStackErrors(violations);
  const locErr = result.fields['Location'];
  if (locErr) {
    result.fields['Location.Area'] = locErr;
    delete result.fields['Location'];
  }
  return result;
},
```

---

## Violation Mapping (`src/hooks/use-proto-validation.ts`)

### `violationsToTanStackErrors(violations)`

Converts a protovalidate violation array into a TanStack-compatible error shape:

```ts
{ form: string | string[], fields: Record<string, string | string[]> }
```

Field paths are derived from violation descriptors using `.name` / `.localName` / `.jsonName`, joined with `.` for nested messages. Falls back to scanning the violation message text for common fields like `Password`.

The function also stores _aliases_ — for a violation at `Location.Area`, it also registers `Area` — so field components can match by their short name.

### `matchFieldErrors(fields, fieldName)` (`src/components/forms/fields/utils.ts`)

Used inside field components to find their error from the submit error map. Tries:
1. Exact path match (`Location.Area`)
2. Last segment (`Area`)
3. camelCase last segment (`area`)
4. Case-insensitive suffix search

---

## Field Components (`src/components/forms/fields/`)

All field components follow this pattern:

```ts
export function TextField({ label, description, disabled }) {
  const field = useFieldContext<string | undefined>();
  const form = useFormContext();

  return (
    <form.Subscribe selector={(s) => ({ submit: s.submitErrors, sync: s.errors })}>
      {(errState) => {
        const errors = /* merge field.state.meta.errors + submit + sync errors */;
        return (
          <UIField data-invalid={errors.length > 0}>
            <FieldLabel>{label ?? field.name}</FieldLabel>
            <Input value={field.state.value} onChange={...} />
            {errors.length > 0 && <FieldError errors={errors} />}
          </UIField>
        );
      }}
    </form.Subscribe>
  );
}
```

Key points:
- `useFieldContext()` — gets the current field's state and handlers (value, handleChange, handleBlur, etc.)
- `useFormContext()` — gets the parent form to subscribe to form-level error state
- Errors are merged from three sources: `field.state.meta.errors`, `submitErrors.fields`, and `errors.fields`
- `matchFieldErrors()` handles the fuzzy path matching so `Location.Area` maps to a field named `Area`

### Available fields

| Field | Use for |
|---|---|
| `TextField` | Single-line string |
| `TextAreaField` | Multi-line string |
| `PasswordField` | Password input |
| `NumberField` | Numeric input |
| `MoneyCentsField` | Currency stored as integer cents |
| `SwitchField` | Boolean toggle (switch UI) |
| `BooleanField` | Boolean (checkbox UI) |
| `HiddenField` | Hidden value (e.g. IDs) |
| `RichTextField` | WYSIWYG HTML editor |
| `TextListField` | Editable list of strings |
| `DateTimeField` | Date + time picker |
| `ColorField` | Color picker |
| `ImagePickerField` | Image asset picker |
| `SubscriptionTierField` | Subscription tier selector |
| `TierListField` | Ordered tier list |
| `ChannelSelectField` | Single channel select |
| `ChannelMultiSelectField` | Multi-channel select |
| `MultiSelectField` | Generic multi-select |
| `CategorySelectField` | Single category select |
| `CategoryMultiSelectField` | Multi-category select |
| `ContentTypeSelectField` | Content type select |
| `RoleSelectField` | User role select |
| `JobTypeSelect` | Employment type select |
| `PageSizeField` | Page size selector |
| `YoutubeLinkField` | YouTube video ID |
| `RumbleLinkField` | Rumble video ID |
| `MFAField` | MFA code input |
| `TicketClassesField` | Event ticket class list |
| `EventVenuesField` | Event venue list |
| `SubmitErrors` | Renders form-level submit errors |

---

## Field Groups (`src/components/forms/groups/`)

Field groups are reusable clusters of fields created with `withFieldGroup()`. They receive a `fields` prop that maps logical names to actual dotted form paths.

```ts
export const ListingLocationFieldGroup = withFieldGroup({
  defaultValues: create(ListingLocationSchema),
  render: function Render({ group }) {
    return (
      <FieldGroup>
        <group.AppField name='Area' children={(f) => <f.TextField label='Area' />} />
        <group.AppField name='RelocationRequired' children={(f) => <f.SwitchField />} />
        <group.AppField name='EmploymentType' children={(f) => <f.JobTypeSelect />} />
      </FieldGroup>
    );
  },
});
```

Usage in a form — pass the parent form and a `fields` map:

```tsx
<ListingLocationFieldGroup
  form={form}
  fields={{
    Area: 'Location.Area',
    RelocationRequired: 'Location.RelocationRequired',
    EmploymentType: 'Location.EmploymentType',
  } as never}
/>
```

The `fields` map translates the group's local names (e.g. `Area`) to full paths in the parent form schema (e.g. `Location.Area`). The `as never` cast is needed because TanStack's generic inference can't resolve the nested path types automatically.

---

## Writing a Form

### Basic create form

```tsx
'use client';
import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { CreateThingRequestSchema } from '@inverted-tech/fragments/Things';
import { createThing } from '@/app/actions/things';
import { useRouter } from 'next/navigation';

export function CreateThingForm() {
  const router = useRouter();
  const form = useProtoAppForm({
    schema: CreateThingRequestSchema,
    onSubmitAsync: async ({ value }) => {
      const res = await createThing(value);
      if (res.Error?.Reason) {
        return { form: res.Error.Message || 'Failed to create' };
      }
      router.push('/things');
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppForm>
        <form.AppField name='Title' children={(f) => <f.TextField />} />
        <form.SubmitErrors />
        <form.CreateButton label='Create' />
      </form.AppForm>
    </form>
  );
}
```

### Edit form with server-managed fields

```tsx
const form = useProtoAppForm({
  schema: ThingRecordSchema,
  defaultValues: create(ThingRecordSchema, thing),
  normalizeBeforeValidate: (value) => {
    const { CreatedOnUTC, ModifiedOnUTC, DeletedOnUTC, ...rest } = value as any;
    return rest as typeof value;
  },
  onSubmitAsync: async ({ value }) => {
    const { CreatedOnUTC, ModifiedOnUTC, DeletedOnUTC, ...fields } = value as any;
    const req = create(UpdateThingRequestSchema, { ThingId: thing.ThingId, Thing: fields });
    const res = await updateThing(req);
    if (res.Error?.Reason && res.Error.Reason !== 'ERROR_REASON_NO_ERROR') {
      return { form: res.Error.Message || 'Failed to update' };
    }
    router.push(`/things/${res.Record?.ThingId}`);
  },
});
```

---

## Error Flow Summary

```
form.handleSubmit()
  → TanStack calls validators.onSubmitAsync
      → normalizeBeforeValidate(value)
      → protovalidate validator
      → filter violations
      → mapViolations() or violationsToTanStackErrors()
      → manual group checks
      → if no errors: onSubmitAsync({ value }) → server action
          → return { form, fields } to surface errors
          → return void to indicate success
  → TanStack calls onSubmit → onValidSubmit (if provided)
```

Field components pick up errors from:
- `field.state.meta.errors` — field-level validator errors
- `form.submitErrors.fields` — errors returned from `onSubmitAsync`
- `form.errors.fields` — sync validator errors

All three are merged and de-duplicated before display.

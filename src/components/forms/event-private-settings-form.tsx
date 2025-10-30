'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { ModifyEventPrivateSettingsRequestSchema } from '@inverted-tech/fragments/Settings';
import { EventPrivateSettingsVenuesFieldGroup } from './groups/settings/event-settings-field-groups';

export function EventPrivateSettingsForm({ base }: { base?: any }) {
  // Map logical field names to form paths for the field group
  const fields = {
    Venues: 'Data.Venues',
  } as const;
  const form = useProtoAppForm({
    schema: ModifyEventPrivateSettingsRequestSchema,
    defaultValues: base as any,
    onValidSubmit: async ({ value }) => {
      // For now, just log submitted values
      // eslint-disable-next-line no-console
      console.log('Submitting event private settings', value);
    },
  });

  return (
    <SettingsForm form={form}>
      <SettingsSection title="Private" description="Manage event venues.">
        <EventPrivateSettingsVenuesFieldGroup
          form={form as any}
          fields={fields as any}
        />
      </SettingsSection>
    </SettingsForm>
  );
}

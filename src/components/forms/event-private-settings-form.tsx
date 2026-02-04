'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { ModifyEventPrivateSettingsRequestSchema } from '@inverted-tech/fragments/Settings';
import { EventPrivateSettingsVenuesFieldGroup } from './groups/settings/event-settings-field-groups';
import { useRouter } from 'next/navigation';

export function EventPrivateSettingsForm({ base }: { base?: any }) {
  const router = useRouter();
  // Map logical field names to form paths for the field group
  const fields = {
    Venues: 'Data.Venues',
  } as const;
  const form = useProtoAppForm({
    schema: ModifyEventPrivateSettingsRequestSchema,
    defaultValues: base as any,
    onSubmitAsync: async ({ value }) => {
      const { modifyEventsPrivateSettings } = await import(
        '@/app/actions/settings'
      );
      // TODO: Handle API response/errors and surface feedback to the user.
      await modifyEventsPrivateSettings(value as any);
      try { router.refresh(); } catch {}
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

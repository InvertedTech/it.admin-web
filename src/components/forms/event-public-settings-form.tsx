'use client';

import { SettingsForm, SettingsSection } from '@/components/settings';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
  EventPublicSettings,
  EventPublicSettingsSchema,
} from '@inverted-tech/fragments/Authorization/Events/index';
import { EventPublicSettingsFieldGroup } from './groups/settings/event-settings-field-groups';
import { useRouter } from 'next/navigation';

export function EventPublicSettingsForm({
    data,
}: {
    data?: EventPublicSettings;
}) {
    const router = useRouter();
    // Map logical field names to form paths (validate inner message)
    const fields = {
        TicketClasses: 'TicketClasses',
    } as const;

	// Sanitize defaults: strip foreign-only fields like TicketClassId
	const sanitized = ((): any => {
		if (!data) return undefined as any;
		const tc = Array.isArray((data as any)?.TicketClasses)
			? (data as any).TicketClasses.map(({ TicketClassId, ...rest }: any) => rest)
			: undefined;
		return { ...(data as any), TicketClasses: tc };
	})();

	const form = useProtoAppForm({
		schema: EventPublicSettingsSchema,
		defaultValues: sanitized as any,
		onSubmitAsync: async ({ value }) => {
			const { modifyEventsPublicSettings } = await import(
				'@/app/actions/settings'
			);
			// TODO: Handle API response/errors and surface feedback to the user.
			await modifyEventsPublicSettings({ Data: value } as any);
			try { router.refresh(); } catch {}
		},
		onValidatorError: 'ignore',
		disableValidation: true,
	});

	return (
        <SettingsForm form={form}>
            <SettingsSection
                title="Public"
                description="Manage ticket classes and pricing."
            >
                <EventPublicSettingsFieldGroup
                    form={form as any}
                    fields={fields as any}
                />
            </SettingsSection>
        </SettingsForm>
    );
}

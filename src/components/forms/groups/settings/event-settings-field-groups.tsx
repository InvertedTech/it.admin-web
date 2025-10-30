import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	EventPrivateSettingsSchema,
	EventPublicSettingsSchema,
} from '@inverted-tech/fragments/Authorization/Events/index';

export const EventPublicSettingsFieldGroup = withFieldGroup({
	defaultValues: create(EventPublicSettingsSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField name="TicketClasses">
					{(f) => <f.TicketClassesField label="Ticket Classes" />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

export const EventPrivateSettingsVenuesFieldGroup = withFieldGroup({
	defaultValues: create(EventPrivateSettingsSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField name="Venues">
					{(f) => <f.EventVenuesField label="Venues" />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

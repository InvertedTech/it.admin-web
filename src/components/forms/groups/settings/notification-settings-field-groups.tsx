import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { SendgridOwnerSettingsSchema } from '@inverted-tech/fragments/protos/Notification/NotificationSettings_pb';

export const SendgridOwnerSettingsFieldGroup = withFieldGroup({
	defaultValues: create(SendgridOwnerSettingsSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='Enabled'
					children={(f) => <f.SwitchField label='Enabled' />}
				/>
				<group.AppField
					name='ApiKeySecret'
					children={(f) => <f.PasswordField label='Api Key Secret' />}
				/>
				<group.AppField
					name='SendFromAddress'
					children={(f) => <f.TextField label='Send From Address' />}
				/>
			</FieldGroup>
		);
	},
});

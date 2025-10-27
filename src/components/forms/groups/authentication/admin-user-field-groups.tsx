import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	ChangeOtherPasswordRequestSchema,
	ModifyOtherUserRequestSchema,
} from '@inverted-tech/fragments/protos/Authentication/UserInterface_pb';

export const AdminEditOtherUserFieldGroups = withFieldGroup({
	defaultValues: create(ModifyOtherUserRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='UserID'
					children={(f) => <f.TextField label='User Id' disabled />}
				/>
				<group.AppField
					name='UserName'
					children={(f) => <f.TextField label='User Name' />}
				/>
				<group.AppField
					name='DisplayName'
					children={(f) => <f.TextField label='Display Name' />}
				/>
				<group.AppField
					name='Email'
					children={(f) => <f.TextField label='Email' />}
				/>
				<group.AppField
					name='Bio'
					children={(f) => <f.TextAreaField label='Bio' />}
				/>
			</FieldGroup>
		);
	},
});

export const AdminChangeOtherPasswordFieldGroups = withFieldGroup({
	defaultValues: create(ChangeOtherPasswordRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='UserID'
					children={(f) => <f.TextField label='User Id' disabled />}
				/>

				<group.AppField
					name='NewPassword'
					children={(f) => <f.PasswordField label='New Password' />}
				/>
			</FieldGroup>
		);
	},
});

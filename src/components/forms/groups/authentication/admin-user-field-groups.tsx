import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	ChangeOtherPasswordRequestSchema,
	CreateUserRequestSchema,
	ModifyOtherUserRequestSchema,
} from '@inverted-tech/fragments/Authentication/index';

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
					name='FirstName'
					children={(f) => <f.TextField label='FirstName' />}
				/>
				<group.AppField
					name='LastName'
					children={(f) => <f.TextField label='LastName' />}
				/>
				<group.AppField
					name='PostalCode'
					children={(f) => <f.TextField label='PostalCode' />}
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

export const CreateUserFieldGroups = withFieldGroup({
	defaultValues: create(CreateUserRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='UserName'
					children={(f) => <f.TextField label='User Name' />}
				/>
				<group.AppField
					name='Password'
					children={(f) => <f.PasswordField label='Password' />}
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
					name='FirstName'
					children={(f) => <f.TextField label='FirstName' />}
				/>
				<group.AppField
					name='LastName'
					children={(f) => <f.TextField label='LastName' />}
				/>
				<group.AppField
					name='PostalCode'
					children={(f) => <f.TextField label='PostalCode' />}
				/>
				<group.AppField
					name='Bio'
					children={(f) => <f.TextAreaField label='Bio' />}
				/>
			</FieldGroup>
		);
	},
});

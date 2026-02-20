import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { RoleMeta, Roles as AllRoles } from '@/lib/roles';
import { create } from '@bufbuild/protobuf';
import {
	AdminCreateUserRequestSchema,
	ChangeOtherPasswordRequestSchema,
	CreateUserRequestSchema,
	ModifyOtherUserRequestSchema,
} from '@inverted-tech/fragments/Authentication/index';
import { RoleOption } from '../admin/admin-search-users-field-group';

const ROLE_OPTIONS: RoleOption[] = AllRoles.map((role) => ({
	DisplayName: RoleMeta[role]?.label ?? role,
	RoleValue: role,
}));
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
	defaultValues: create(AdminCreateUserRequestSchema),
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
				<group.AppField
					name='Roles'
					children={(f) => (
						<f.RoleSelectField
							label='Roles'
							options={ROLE_OPTIONS}
						/>
					)}
				/>
			</FieldGroup>
		);
	},
});

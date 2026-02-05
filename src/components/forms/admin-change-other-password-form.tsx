import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { adminEditOtherUserPassword } from '@/app/actions/auth';
import { AdminChangeOtherPasswordFieldGroups } from './groups/authentication/admin-user-field-groups';
import {
	AuthErrorReason,
	ChangeOtherPasswordRequestSchema,
} from '@inverted-tech/fragments/Authentication/index';

export function AdminChangeOtherPasswordForm({ userId }: { userId: string }) {
	const form = useAppForm({
		defaultValues: {
			UserID: userId,
			NewPassword: '',
		},
		onSubmit: async ({ value }) => {
			try {
				const req = create(ChangeOtherPasswordRequestSchema, value);

				const res = await adminEditOtherUserPassword(req);
				console.log(res);

				// TODO: Handle Error Response
			} catch (error) {
				console.error(error);
			}
		},
	});

	const fields = {
		UserID: 'UserID',
		NewPassword: 'NewPassword',
	} as const;

	return (
		<form
			id='change-other-password'
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<AdminChangeOtherPasswordFieldGroups
					form={form}
					fields={fields as any}
				/>
				<form.CreateButton label='Change Password' />
			</form.AppForm>
		</form>
	);
}

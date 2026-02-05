import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { AdminEditOtherUserFieldGroups } from './groups/authentication/admin-user-field-groups';
import { ModifyOtherUserRequestSchema } from '@inverted-tech/fragments/Authentication/index';
import { adminEditOtherUser } from '@/app/actions/auth';

export function AdminEditOtherUserForm({
	userId,
	userName,
	displayName,
	email,
	bio,
}: {
	userId: string;
	userName: string;
	displayName: string;
	email: string;
	bio: string;
}) {
	const form = useAppForm({
		defaultValues: {
			UserID: userId,
			UserName: userName,
			DisplayName: displayName,
			Email: email,
			Bio: bio,
		},
		onSubmit: async ({ value }) => {
			try {
				const req = create(ModifyOtherUserRequestSchema, value);
				const res = await adminEditOtherUser(req);
				console.log(res);

				// TODO: Handle Error/Success Response
			} catch (error) {
				console.error(error);
			}
		},
	});

	const fields = {
		UserID: 'UserID',
		UserName: 'UserName',
		DisplayName: 'DisplayName',
		Email: 'Email',
		Bio: 'Bio',
	};

	return (
		<form
			id='edit-other-user'
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<AdminEditOtherUserFieldGroups
					form={form}
					fields={fields as any}
				/>
				<form.CreateButton label='Submit' />
			</form.AppForm>
		</form>
	);
}

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { AdminCreateUserRequestSchema } from '@inverted-tech/fragments/Authentication';
import { FormCard } from './form-card';
import { CreateUserFieldGroups } from './groups/authentication';
import { createUser } from '@/app/actions/auth';
import { APIErrorReason } from '@inverted-tech/fragments';
import { useRouter } from 'next/navigation';
export function AdminCreateUserForm() {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: AdminCreateUserRequestSchema,
		defaultInit: {
			UserName: '',
			DisplayName: '',
			Email: '',
			Bio: '',
			FirstName: '',
			LastName: '',
			PostalCode: '',
			Password: '',
			Roles: [],
		},
		onValidSubmit: async ({ value, formApi }) => {
			const req = create(AdminCreateUserRequestSchema, value);
			const res = await createUser(req);
			// TODO: Map res.Error to form error if res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
			// if (
			// 	res.Error &&
			// 	res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
			// ) {
			// 	// formApi.setError('root', {
			// 	// 	type: 'server',
			// 	// 	message: res.Error.Message || 'An error occurred',
			// 	// });
			// 	return;
			// }

			router.push(`/users/${res.UserId}`);
			return;
		},
	});

	const fields = {
		UserName: 'UserName',
		DisplayName: 'DisplayName',
		Email: 'Email',
		Bio: 'Bio',
		FirstName: 'FirstName',
		LastName: 'LastName',
		PostalCode: 'PostalCode',
		Password: 'Password',
		Roles: 'Roles',
	} as const;

	return (
		<FormCard cardTitle='Create User' cardDescription='Create A New User'>
			<form onSubmit={form.handleSubmit}>
				<form.AppForm>
					<CreateUserFieldGroups fields={fields as any} form={form} />
					<form.CreateButton label='Submit' />
				</form.AppForm>
			</form>
		</FormCard>
	);
}

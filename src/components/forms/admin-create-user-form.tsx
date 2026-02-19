import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { CreateUserRequestSchema } from '@inverted-tech/fragments/Authentication';
import { FormCard } from './form-card';
import { CreateUserFieldGroups } from './groups/authentication';
import { createUser } from '@/app/actions/auth';
import { APIErrorReason } from '@inverted-tech/fragments';
import { useRouter } from 'next/navigation';
export function AdminCreateUserForm() {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CreateUserRequestSchema,
		defaultInit: {
			UserName: '',
			DisplayName: '',
			Email: '',
			Bio: '',
			FirstName: '',
			LastName: '',
			PostalCode: '',
			Password: '',
		},
		onValidSubmit: async ({ value, formApi }) => {
			const req = create(CreateUserRequestSchema, value);
			const res = await createUser(req);
			if (
				res.Error &&
				res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
			) {
				formApi.setError('root', {
					type: 'server',
					message: res.Error.Message || 'An error occurred',
				});
				// TODO: better error handling, maybe field specific errors if the API supports it
				return;
			}
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
	} as const;

	return (
		<FormCard
			cardTitle="Create User"
			cardDescription="Create A New User"
		>
			<form onSubmit={form.handleSubmit}>
				<form.AppForm>
					<CreateUserFieldGroups
						fields={fields as any}
						form={form}
					/>
					<form.CreateButton label="Submit" />
				</form.AppForm>
			</form>
		</FormCard>
	);
}

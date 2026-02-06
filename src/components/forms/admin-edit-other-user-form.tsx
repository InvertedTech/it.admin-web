import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { AdminEditOtherUserFieldGroups } from './groups/authentication/admin-user-field-groups';
import {
	AuthErrorReason,
	ModifyOtherUserRequestSchema,
} from '@inverted-tech/fragments/Authentication/index';
import { adminEditOtherUser } from '@/app/actions/auth';
import { toast } from 'sonner';

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
		onSubmit: async ({ value, formApi }) => {
			try {
				const req = create(ModifyOtherUserRequestSchema, value);
				const res = await adminEditOtherUser(req);
				console.log(res);

				const err = (res as any)?.Error;
				if (err) {
					const message =
						err?.Message ?? 'Failed to update the user';
					type FieldKey =
						| 'UserID'
						| 'UserName'
						| 'DisplayName'
						| 'Email'
						| 'Bio';
					const fields: Partial<Record<FieldKey, string | string[]>> =
						{};
					const addFieldError = (key: string, msg: string) => {
						if (!key) return;
						if (!['UserID', 'UserName', 'DisplayName', 'Email', 'Bio'].includes(key))
							return;
						const k = key as FieldKey;
						if (!fields[k]) fields[k] = msg;
						else
							fields[k] = Array.isArray(fields[k])
								? [...(fields[k] as string[]), msg]
								: [fields[k] as string, msg];
					};

					if (Array.isArray(err?.Validation)) {
						for (const v of err.Validation) {
							addFieldError(
								(v as any)?.field ?? '',
								(v as any)?.message ?? 'Invalid value',
							);
						}
					}

					if (
						err?.Type ===
						AuthErrorReason.MODIFY_OTHER_USER_ERROR_USERNAME_TAKEN
					) {
						addFieldError('UserName', 'Username already taken');
					}
					if (
						err?.Type ===
						AuthErrorReason.MODIFY_OTHER_USER_ERROR_EMAIL_TAKEN
					) {
						addFieldError('Email', 'Email already in use');
					}

					formApi?.setErrorMap?.({
						onSubmit: {
							form: message,
							fields:
								Object.keys(fields).length > 0 ? fields : {},
						},
					});
					toast('Update failed', { description: message });
					return;
				}

				toast('User updated');
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

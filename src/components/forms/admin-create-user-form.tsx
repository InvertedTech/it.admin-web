import { useAppForm } from '@/hooks/app-form';

export function AdminCreateUserForm() {
	const form = useAppForm({
		defaultValues: {
			UserName: '',
			DisplayName: '',
			Email: '',
			Bio: '',
			FirstName: '',
			LastName: '',
			PostalCode: '',
		},
	});
}

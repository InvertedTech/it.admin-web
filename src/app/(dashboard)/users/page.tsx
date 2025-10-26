'use server';

import { listUsers } from '@/app/actions/auth';
import { UsersTable } from '@/components/tables/users-table';

export default async function AllUsersPage() {
	const users = await listUsers();

	return (
		<>
			<UsersTable data={users.Records} />
		</>
	);
}

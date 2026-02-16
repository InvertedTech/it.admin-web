'server-only';
import { redirect } from 'next/navigation';
import { getSession } from './cookies';

export async function requireRole(
	check: (roles: string[]) => boolean,
	redirectTo = '/unauthorized',
) {
	const session = await getSession();
	if (!session) redirect('/login');
	if (!check(session.roles)) redirect(redirectTo);
}

export async function requireAnyRole(redirectTo = '/unauthorized') {
	const session = await getSession();
	if (!session) redirect('/login');
	if (session.roles.length === 0) redirect(redirectTo);
}

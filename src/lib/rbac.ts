'server-only';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export async function requireRole(
	check: (roles: string[]) => boolean,
	redirectTo = '/unauthorized',
) {
	const session = await getSession();
	const roles = session.roles ?? [];
	if (roles.length === 0 || !check(roles)) {
		redirect(redirectTo);
	}
}

export async function requireAnyRole(redirectTo = '/unauthorized') {
	return requireRole((roles) => roles.length > 0, redirectTo);
}

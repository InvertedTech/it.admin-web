'server-only';

import { redirect } from 'next/navigation';
import { getSessionRoles } from '@/lib/session';

export async function requireRole(
	check: (roles: string[]) => boolean,
	redirectTo = '/unauthorized',
) {
	// TODO(auth-removal): Remove role/authorization read.
	const roles = await getSessionRoles();
	// TODO(auth-removal): Remove role/authorization gate.
	if (roles.length === 0 || !check(roles)) {
		redirect(redirectTo);
	}
}

export async function requireAnyRole(redirectTo = '/unauthorized') {
	// TODO(auth-removal): Remove role/authorization gate.
	return requireRole((roles) => roles.length > 0, redirectTo);
}

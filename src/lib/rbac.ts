'server-only';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export async function requireRole(
	check: (roles: string[]) => boolean,
	redirectTo = '/unauthorized',
) {
	const session = await getSession();
	const raw = session.roles as unknown;
	const roles = (Array.isArray(raw) ? raw : raw ? [String(raw)] : []).filter(
		(r) => typeof r === 'string' && r.trim().length > 0,
	);
	if (roles.length === 0 || !check(roles)) {
		redirect(redirectTo);
	}
}

export async function requireAnyRole(redirectTo = '/unauthorized') {
	return requireRole((roles) => roles.length > 0, redirectTo);
}

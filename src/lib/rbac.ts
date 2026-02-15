'server-only';

export async function requireRole(
	_check: (roles: string[]) => boolean,
	_redirectTo = '/unauthorized',
) {
	return;
}

export async function requireAnyRole(_redirectTo = '/unauthorized') {
	return;
}

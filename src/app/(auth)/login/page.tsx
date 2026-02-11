import { redirect } from 'next/navigation';

export default function Page() {
	const loginRedirect = process.env.IT_LOGIN_REDIRECT?.trim();
	if (!loginRedirect) {
		throw new Error('IT_LOGIN_REDIRECT is not set');
	}
	redirect(loginRedirect);
}

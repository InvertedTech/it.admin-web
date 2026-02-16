'use server';
import { LoginForm } from '@/components/forms';
import { redirect } from 'next/navigation';

export default async function Page() {
	const mode: 'azure' | 'form' =
		(process.env.AUTH_MODE as 'azure' | 'form') ?? 'form';
	const msftRedirect = process.env.IT_LOGIN_REDIRECT!;

	if (mode === 'azure') return redirect(msftRedirect);

	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-sm'>
				<LoginForm msftRedirect={msftRedirect} />
			</div>
		</div>
	);
}

'use server';
import { LoginForm } from '@/components/forms';

// TODO: Add Support For AD when phillip does his thing
export default async function Page() {
	const msftRedirect = process.env.IT_LOGIN_REDIRECT ?? '';

	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-sm'>
				<LoginForm msftRedirect={msftRedirect} />
			</div>
		</div>
	);
}

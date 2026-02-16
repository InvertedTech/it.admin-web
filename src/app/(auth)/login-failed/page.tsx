import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginFailedPage() {
	const msftRedirect = process.env.IT_LOGIN_REDIRECT!;

	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-md text-center space-y-6'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Login With Microsoft Failed
				</h1>
				<p className='text-muted-foreground'>
					Something went wrong during the login process. Please try
					again or contact your administrator if the issue persists.
				</p>
				<Button asChild>
					<Link href={msftRedirect}>Try Again</Link>
				</Button>
			</div>
		</div>
	);
}

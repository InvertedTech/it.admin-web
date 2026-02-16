import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoggedOutPage() {
	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-md text-center space-y-6'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					You have been logged out
				</h1>
				<p className='text-muted-foreground'>
					Your session has ended.
				</p>
				<Button asChild>
					<Link href='/login'>Back to Login</Link>
				</Button>
			</div>
		</div>
	);
}

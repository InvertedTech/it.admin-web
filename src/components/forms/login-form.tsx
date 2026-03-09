'use client';

import { Button } from '@/components/ui/button';
import { FormCard } from './form-card';
import { useRouter } from 'next/navigation';

type Props = { msftRedirect: string; from?: string };

export function LoginForm({ msftRedirect }: Props) {
	const router = useRouter();

	return (
		<FormCard cardTitle='Login' cardDescription='Login To Your Account'>
			<div className='flex flex-col gap-2'>
				<Button
					variant='outline'
					type='button'
					className='border-[#8C8C8C] bg-white text-[#5E5E5E] hover:bg-[#F3F2F1] hover:text-[#323130]'
					onClick={(e) => {
						e.preventDefault();
						router.push(msftRedirect);
					}}
				>
					<svg
						aria-hidden='true'
						viewBox='0 0 23 23'
						className='size-4'
					>
						<rect
							x='1'
							y='1'
							width='10'
							height='10'
							fill='#F25022'
						/>
						<rect
							x='12'
							y='1'
							width='10'
							height='10'
							fill='#7FBA00'
						/>
						<rect
							x='1'
							y='12'
							width='10'
							height='10'
							fill='#00A4EF'
						/>
						<rect
							x='12'
							y='12'
							width='10'
							height='10'
							fill='#FFB900'
						/>
					</svg>
					Login with Microsoft
				</Button>
			</div>
		</FormCard>
	);
}

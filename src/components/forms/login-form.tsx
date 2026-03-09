import { FormCard } from './form-card';

type Props = { msftRedirect: string; from?: string };

export function LoginForm({ msftRedirect }: Props) {
	return (
		<FormCard cardTitle='Login' cardDescription='Login To Your Account'>
			<div className='flex flex-col gap-2'>
				<a
					href={msftRedirect}
					className='inline-flex items-center justify-center gap-2 rounded-md border border-[#8C8C8C] bg-background px-4 py-2 text-sm text-[#5E5E5E] transition-colors hover:bg-[#F3F2F1] hover:text-[#323130]'
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
				</a>
			</div>
		</FormCard>
	);
}

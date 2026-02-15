'use client';

import { Button } from '@/components/ui/button';
import { FormCard } from './form-card';
import { useRouter } from 'next/navigation';

type Props = { msftRedirect?: string; from?: string };

export function LoginForm({ from }: Props) {
	const router = useRouter();

	return (
		<FormCard
			cardTitle="Authentication Removed"
			cardDescription="This app no longer requires login."
		>
			<div className="flex flex-col gap-2">
				<Button
					type="button"
					onClick={() => {
						router.push(from ?? '/');
					}}
				>
					Continue
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						router.push('/');
					}}
				>
					Go Home
				</Button>
			</div>
		</FormCard>
	);
}

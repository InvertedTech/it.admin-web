'use server';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { requireRole } from '@/lib/rbac';
import { isMemberManagerOrHigher } from '@/lib/roleHelpers';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

type Props = {
	searchParams: Promise<{
		valid?: string;
		name?: string;
		level?: string;
		reason?: string;
	}>;
};

export default async function VerifyQRPage({ searchParams }: Props) {
	const {
		valid: validRaw,
		name,
		level: levelRaw,
		reason,
	} = await searchParams;
	await requireRole(isMemberManagerOrHigher);

	const valid = validRaw === 'true';
	const level = levelRaw !== undefined ? Number(levelRaw) : undefined;

	if (!valid) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<Card className='w-full max-w-sm border-destructive/50 bg-destructive/5'>
					<CardHeader className='pb-3 text-center'>
						<div className='flex justify-center mb-3'>
							<ShieldAlert className='h-12 w-12 text-destructive' />
						</div>
						<CardTitle className='text-destructive text-xl'>
							Invalid QR Code
						</CardTitle>
					</CardHeader>
					<Separator className='bg-destructive/20' />
					<CardContent className='pt-4 text-center space-y-2'>
						<p className='text-sm text-muted-foreground'>
							The QR code you scanned is not valid. Please make
							sure you are scanning the correct QR code and try
							again.
						</p>
						{name && (
							<p className='text-sm text-muted-foreground'>
								Display Name:{' '}
								<span className='font-semibold text-foreground'>
									{name}
								</span>
							</p>
						)}
						{level !== undefined && (
							<div className='flex items-center justify-center gap-2'>
								<span className='text-xs text-muted-foreground'>
									Access Level
								</span>
								<Badge variant='secondary' className='text-xs'>
									Level {level}
								</Badge>
							</div>
						)}
						{reason && (
							<p className='text-xs text-destructive/80 font-medium'>
								Reason: {reason}
							</p>
						)}
						<p className='text-xs text-muted-foreground'>
							If the problem persists, contact support for
							assistance.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='flex items-center justify-center min-h-[60vh]'>
			<Card className='w-full max-w-sm border-green-500/50 bg-green-500/5'>
				<CardHeader className='pb-3 text-center'>
					<div className='flex justify-center mb-3'>
						<CheckCircle2 className='h-12 w-12 text-green-500' />
					</div>
					<CardTitle className='text-green-600 dark:text-green-400 text-xl'>
						QR Code Verified
					</CardTitle>
				</CardHeader>
				<Separator className='bg-green-500/20' />
				<CardContent className='pt-4 text-center space-y-3'>
					{name && (
						<p className='text-sm text-muted-foreground'>
							Welcome,{' '}
							<span className='font-semibold text-foreground'>
								{name}
							</span>
							!
						</p>
					)}
					{level !== undefined && (
						<div className='flex items-center justify-center gap-2'>
							<span className='text-xs text-muted-foreground'>
								Access Level
							</span>
							<Badge variant='secondary' className='text-xs'>
								Level {level}
							</Badge>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

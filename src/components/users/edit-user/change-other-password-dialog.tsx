'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { AdminChangeOtherPasswordForm } from '@/components/forms/admin-change-other-password-form';

export function ChangeOtherPasswordDialog({
	userId,
	canOpen = false,
}: {
	userId: string;
	canOpen?: boolean;
}) {
	if (!canOpen) return null;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline'>Change Password</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Set a new password for this user.
					</DialogDescription>
				</DialogHeader>
				<AdminChangeOtherPasswordForm userId={userId} />
			</DialogContent>
		</Dialog>
	);
}

'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { AdminEditOtherUserForm } from '@/components/forms/admin-edit-other-user-form';
import { isAdminOrHigher } from '@/lib/roleHelpers';

export function EditOtherUserDialog({
	userId,
	userName,
	displayName,
	email,
	bio,
	roles = [],
}: {
	userId: string;
	userName: string;
	displayName: string;
	email: string;
	bio: string;
	roles?: string[];
}) {
	const canOpen = isAdminOrHigher(roles);
	if (!canOpen) return null;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline'>Edit Profile</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update this user’s public profile details.
					</DialogDescription>
				</DialogHeader>
				<AdminEditOtherUserForm
					userId={userId}
					userName={userName}
					displayName={displayName}
					email={email}
					bio={bio}
				/>
			</DialogContent>
		</Dialog>
	);
}

'use client';

import { useState } from 'react';
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

export function EditOtherUserDialog({
	userId,
	userName,
	displayName,
	email,
	bio,
	firstName,
	lastName,
	postalCode,
	canOpen = false,
}: {
	userId: string;
	userName: string;
	displayName: string;
	email: string;
	bio: string;
	firstName: string;
	lastName: string;
	postalCode: string;
	canOpen?: boolean;
}) {
	const [open, setOpen] = useState(false);

	if (!canOpen) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Edit Profile</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update this user&apos;s public profile details.
					</DialogDescription>
				</DialogHeader>
				<AdminEditOtherUserForm
					userId={userId}
					userName={userName}
					displayName={displayName}
					email={email}
					bio={bio}
					firstName={firstName}
					lastName={lastName}
					postalCode={postalCode}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

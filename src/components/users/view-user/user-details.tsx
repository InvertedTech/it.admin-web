'use client';

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';
import { EditOtherUserDialog } from '@/components/users/edit-user/edit-other-user-dialog';
import { Button } from '@/components/ui/button';

// small row renderer
function Row({
	label,
	value,
	copy,
	multiline,
}: {
	label: string;
	value: string;
	copy?: boolean;
	multiline?: boolean;
}) {
	return (
		<div className="grid grid-cols-3 items-start gap-3">
			<div className="text-muted-foreground text-sm">{label}</div>
			<div className="col-span-2 flex items-start gap-2">
				<span className={multiline ? '' : 'truncate'}>{value || '—'}</span>
				{copy && value ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={async () => navigator.clipboard.writeText(value)}
					>
						Copy
					</Button>
				) : null}
			</div>
		</div>
	);
}

export function UserDetails({
	id,
	userName,
	displayName,
	email,
	bio,
	firstName,
	lastName,
	postalCode,
	roles,
	canEditProfile,
}: {
	id: string;
	userName: string;
	displayName: string;
	email?: string;
	bio?: string;
	firstName?: string;
	lastName?: string;
	postalCode?: string;
	roles?: string[];
	canEditProfile?: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="space-y-1">
					<CardTitle>Profile</CardTitle>
					<CardDescription>Public information</CardDescription>
				</div>
				{canEditProfile ? (
					<EditOtherUserDialog
						userId={id}
						userName={userName}
						displayName={displayName}
						email={email ?? ''}
						bio={bio ?? ''}
						firstName={firstName ?? ''}
						lastName={lastName ?? ''}
						postalCode={postalCode ?? ''}
						canOpen={canEditProfile}
					/>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">
				<Row
					label="User ID"
					value={id}
					copy
				/>
				<Row
					label="Username"
					value={userName}
				/>
				<Row
					label="Email"
					value={email || ''}
				/>
				<Row
					label="First Name"
					value={firstName || ''}
				/>
				<Row
					label="Last Name"
					value={lastName || ''}
				/>
				<Row
					label="Postal Code"
					value={postalCode || ''}
				/>
				<Row
					label="Bio"
					value={bio || ''}
					multiline
				/>
				<div className="pt-2">
				</div>
			</CardContent>
		</Card>
	);
}

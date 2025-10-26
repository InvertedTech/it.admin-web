'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';

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
	email,
	bio,
}: {
	id: string;
	userName: string;
	email?: string;
	bio?: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Public information</CardDescription>
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
					label="Bio"
					value={bio || ''}
					multiline
				/>
			</CardContent>
		</Card>
	);
}

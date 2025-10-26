'use client';

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
	id: string;
	displayName: string;
	userName: string;
	email: string;
	roles: string[];
	profilePng?: string;
	disabled?: boolean;
};

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase())
		.join('');
}

export function UserHeaderCard({
	id,
	displayName,
	userName,
	email,
	roles,
	profilePng,
	disabled,
}: Props) {
	const statusBadge = disabled ? (
		<Badge variant="secondary">Disabled</Badge>
	) : (
		<Badge>Active</Badge>
	);

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="bg-muted text-foreground/80 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border">
						{profilePng ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={profilePng}
								alt={displayName}
								className="h-full w-full object-cover"
							/>
						) : (
							<span className="text-lg">
								{initials(displayName || userName)}
							</span>
						)}
					</div>
					<div>
						<CardTitle className="text-xl">{displayName}</CardTitle>
						<CardDescription>
							@{userName} · {email || 'no email'}
						</CardDescription>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							{statusBadge}
							{roles.length ? (
								roles.map((r) => (
									<Badge
										key={r}
										variant="outline"
										className="px-1.5"
									>
										{r}
									</Badge>
								))
							) : (
								<Badge
									variant="outline"
									className="px-1.5"
								>
									no-roles
								</Badge>
							)}
						</div>
					</div>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button
						asChild
						variant="outline"
					>
						<a href={`/users/${id}/edit`}>Edit</a>
					</Button>
					<Button asChild>
						<a href={`/users/${id}`}>Refresh</a>
					</Button>
				</div>
			</CardHeader>
		</Card>
	);
}

'use client';

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Roles as AllRoles, RoleCategories, RoleMeta } from '@/lib/roles';
import * as React from 'react';
import { toast } from 'sonner';
import { ChangeOtherPasswordDialog } from '@/components/users/edit-user/change-other-password-dialog';
import { useRouter } from 'next/navigation';

type Props = {
	id: string;
	displayName: string;
	userName: string;
	email: string;
	roles: string[];
	profilePng?: string;
	disabled?: boolean;
	grantRolesAction?: (formData: FormData) => Promise<void>;
	canGrantRoles?: boolean;
	canEditProfile?: boolean;
	enableUserAction?: () => Promise<void>;
	disableUserAction?: () => Promise<void>;
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
	grantRolesAction,
	canGrantRoles,
	canEditProfile,
	enableUserAction,
	disableUserAction,
}: Props) {
	const router = useRouter();
	const [isDisabled, setIsDisabled] = React.useState(Boolean(disabled));
	const statusBadge = isDisabled ? (
		<Badge variant='secondary'>Disabled</Badge>
	) : (
		<Badge>Active</Badge>
	);

	const [open, setOpen] = React.useState(false);
	const [selectedRoles, setSelectedRoles] = React.useState<string[]>(roles);

	React.useEffect(() => {
		setSelectedRoles(roles);
	}, [roles]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!grantRolesAction) return;
		const fd = new FormData();
		for (const r of selectedRoles) fd.append('roles', r);
		try {
			await grantRolesAction(fd);
			setOpen(false);
			router.refresh();
			toast.success('Roles updated');
		} catch (err) {
			const msg =
				err instanceof Error && err.message
					? err.message
					: 'Failed to update roles';
			toast.error(msg);
		}
	}

	return (
		<Card>
			<CardHeader className='flex flex-row items-start justify-between gap-4'>
				<div className='flex items-center gap-4'>
					<div className='bg-muted text-foreground/80 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border'>
						{profilePng ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={profilePng}
								alt={displayName}
								className='h-full w-full object-cover'
							/>
						) : (
							<span className='text-lg'>
								{initials(displayName || userName)}
							</span>
						)}
					</div>
					<div>
						<CardTitle className='text-xl'>{displayName}</CardTitle>
						<CardDescription>
							@{userName} · {email || 'no email'}
						</CardDescription>
						<div className='mt-2 flex flex-col gap-2'>
							<div className='flex flex-wrap items-center gap-2'>
								{statusBadge}
							</div>
							{roles.length ? (
								<div className='flex flex-col gap-2'>
									{RoleCategories.map((cat) => {
										const catRoles = roles.filter(
											(r) =>
												RoleMeta[
													r as keyof typeof RoleMeta
												]?.category === cat,
										);
										if (!catRoles.length) return null;
										return (
											<div
												key={cat}
												className='flex items-start gap-2'
											>
												<span className='text-muted-foreground text-xs w-28 shrink-0'>
													{cat}
												</span>
												<div className='flex flex-wrap gap-1'>
													{catRoles.map((r) => (
														<Badge
															key={r}
															variant='outline'
															className='px-1.5'
														>
															{RoleMeta[
																r as keyof typeof RoleMeta
															]?.label ?? r}
														</Badge>
													))}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<Badge variant='outline' className='px-1.5'>
									no-roles
								</Badge>
							)}
						</div>
					</div>
				</div>
				<div className='flex shrink-0 gap-2'>
					{enableUserAction && disableUserAction ? (
						isDisabled ? (
							<Button
								onClick={async () => {
									try {
										await enableUserAction();
										setIsDisabled(false);
										toast.success('User enabled');
									} catch (e) {
										toast.error('Failed to enable user');
									}
								}}
							>
								Enable
							</Button>
						) : (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant='destructive'>
										Disable
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Disable user?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This will disable the userâ€™s
											account. They will not be able to
											sign in until re-enabled.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={async () => {
												try {
													await disableUserAction();
													setIsDisabled(true);
													toast.success(
														'User disabled',
													);
												} catch (e) {
													toast.error(
														'Failed to disable user',
													);
												}
											}}
										>
											Disable
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)
					) : null}
					{canGrantRoles && grantRolesAction ? (
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<Button variant='outline'>Grant Roles</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Grant Roles</DialogTitle>
									<DialogDescription>
										Select roles to grant to this user.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={onSubmit} className='space-y-4'>
									<div className='space-y-3'>
										{RoleCategories.map((cat) => (
											<div
												key={cat}
												className='space-y-2'
											>
												<div className='text-xs text-muted-foreground font-medium'>
													{cat}
												</div>
												<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
													{AllRoles.filter(
														(r) =>
															RoleMeta[r]
																.category ===
															cat,
													).map((r) => (
														<label
															key={r}
															className='flex items-center gap-2'
														>
															<Checkbox
																checked={selectedRoles.includes(
																	r,
																)}
																onCheckedChange={(
																	v,
																) => {
																	const isChecked =
																		v ===
																		true;
																	setSelectedRoles(
																		(
																			prev,
																		) => {
																			if (
																				isChecked
																			)
																				return Array.from(
																					new Set(
																						[
																							...prev,
																							r,
																						],
																					),
																				);
																			return prev.filter(
																				(
																					x,
																				) =>
																					x !==
																					r,
																			);
																		},
																	);
																}}
															/>
															<span className='text-sm'>
																{
																	RoleMeta[r]
																		.label
																}
															</span>
														</label>
													))}
												</div>
											</div>
										))}
									</div>
									<DialogFooter>
										<Button type='submit'>Save</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					) : null}
					{canEditProfile ? (
						<ChangeOtherPasswordDialog
							userId={id}
							canOpen={canEditProfile}
						/>
					) : null}
				</div>
			</CardHeader>
		</Card>
	);
}

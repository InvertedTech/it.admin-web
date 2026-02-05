'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
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
import type { TOTPDeviceLimited } from '@inverted-tech/fragments/protos/Authentication/UserInterface_pb';
import { EditOtherUserDialog } from '@/components/users/edit-user/edit-other-user-dialog';

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
	totpDevices,
	disableTotpAction,
	roles,
}: {
	id: string;
	userName: string;
	displayName: string;
	email?: string;
	bio?: string;
	totpDevices?: TOTPDeviceLimited[];
	disableTotpAction?: (formData: FormData) => void | Promise<void>;
	roles?: string[];
}) {
	const devices = totpDevices ?? [];
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="space-y-1">
					<CardTitle>Profile</CardTitle>
					<CardDescription>Public information</CardDescription>
				</div>
				<EditOtherUserDialog
					userId={id}
					userName={userName}
					displayName={displayName}
					email={email ?? ''}
					bio={bio ?? ''}
					roles={roles ?? []}
				/>
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
				<div className="pt-2">
					<Accordion
						type="single"
						collapsible
						className="w-full"
					>
						<AccordionItem value="totp-devices">
							<AccordionTrigger>
								Two-factor authentication devices ({devices.length})
							</AccordionTrigger>
							<AccordionContent>
								<div className="text-muted-foreground text-xs">
									Registered authentication devices
								</div>
								<div className="mt-2 space-y-2">
									{devices.length ? (
										devices.map((device) => (
											<div
												key={device.TotpID}
												className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
											>
												<div className="min-w-0">
													<div className="text-sm font-medium">
														{device.DeviceName ||
															'Unnamed device'}
													</div>
													<div className="text-muted-foreground text-xs">
														{device.TotpID}
													</div>
												</div>
												{disableTotpAction ? (
													<form action={disableTotpAction}>
														<input
															type="hidden"
															name="totpId"
															value={device.TotpID}
														/>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	type="button"
																	variant="destructive"
																	size="sm"
																>
																	Disable
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Disable TOTP device?
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		This will remove access for this device and cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		Cancel
																	</AlertDialogCancel>
																	<AlertDialogAction asChild>
																		<Button
																			type="submit"
																			variant="destructive"
																			size="sm"
																		>
																			Disable
																		</Button>
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</form>
												) : null}
											</div>
										))
									) : (
										<div className="text-muted-foreground text-sm">
											No TOTP devices found.
										</div>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</CardContent>
		</Card>
	);
}

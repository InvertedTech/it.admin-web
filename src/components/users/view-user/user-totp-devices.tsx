'use client';

import type { TOTPDeviceLimited } from '@inverted-tech/fragments/protos/Authentication/UserInterface_pb';
import { Button } from '@/components/ui/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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

export function UserTotpDevices({
	totpDevices,
	disableTotpAction,
	canViewTotp,
}: {
	totpDevices?: TOTPDeviceLimited[];
	disableTotpAction?: (formData: FormData) => void | Promise<void>;
	canViewTotp?: boolean;
}) {
	if (!canViewTotp) return null;
	const devices = totpDevices ?? [];

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle>Two-factor authentication</CardTitle>
				<CardDescription>Registered authentication devices</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion
					type="single"
					collapsible
					className="w-full"
				>
					<AccordionItem value="totp-devices">
						<AccordionTrigger>
							Devices ({devices.length})
						</AccordionTrigger>
						<AccordionContent>
							<div className="mt-2 space-y-2">
								{devices.length ? (
									devices.map((device) => (
										<div
											key={device.TotpID}
											className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
										>
											<div className="min-w-0">
												<div className="text-sm font-medium">
													{device.DeviceName || 'Unnamed device'}
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
			</CardContent>
		</Card>
	);
}

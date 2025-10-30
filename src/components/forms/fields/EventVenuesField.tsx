'use client';
import React from 'react';
import { useFieldContext } from '@/hooks/form-context';
import { Field as UIField, FieldLabel } from '@/components/ui/field';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { v4 as uuid } from 'uuid';
import {
	EventVenueOneOfType,
	PhysicalEventVenue,
	VirtualEventVenue,
} from '@inverted-tech/fragments/Authorization/Events/index';

type VenueOneOf =
	| { case: 'Physical'; value: PhysicalEventVenue }
	| { case: 'Virtual'; value: VirtualEventVenue }
	| { case: undefined; value?: undefined };

type EventVenue = {
	VenueId: string;
	OneOfType: EventVenueOneOfType;
	VenueOneOf: VenueOneOf;
};

function makeDefaultPhysical(): PhysicalEventVenue {
	return {
		Name: '',
		Address: '',
		City: '',
		StateOrProvince: '',
		PostalCode: '',
		Country: '',
		PhoneNumber: '',
		EmailAddress: '',
	} as any;
}
function makeDefaultVirtual(): VirtualEventVenue {
	return {
		Name: '',
		Url: '',
		AccessInstructions: '',
		ContactEmailAddress: '',
	} as any;
}

function defaultVenue(): EventVenue {
	return {
		VenueId: uuid(),
		OneOfType: EventVenueOneOfType.VENUE_ONE_OF_PHYSICAL,
		VenueOneOf: { case: 'Physical', value: makeDefaultPhysical() },
	};
}

export function EventVenuesField({ label = 'Venues' }: { label?: string }) {
	const field = useFieldContext<EventVenue[] | undefined>();
	const venues = field.state.value ?? [];

	function update(idx: number, patch: Partial<EventVenue>) {
		const copy = [...venues];
		copy[idx] = { ...copy[idx], ...patch } as EventVenue;
		field.handleChange(copy);
	}
	function remove(idx: number) {
		const copy = [...venues];
		copy.splice(idx, 1);
		field.handleChange(copy);
	}
	function add() {
		field.handleChange([...(venues as EventVenue[]), defaultVenue()]);
	}

	function onChangeType(i: number, val: string) {
		const next = Number(val) as EventVenueOneOfType;
		if (next === EventVenueOneOfType.VENUE_ONE_OF_VIRTUAL) {
			update(i, {
				OneOfType: next,
				VenueOneOf: { case: 'Virtual', value: makeDefaultVirtual() },
			});
		} else {
			update(i, {
				OneOfType: EventVenueOneOfType.VENUE_ONE_OF_PHYSICAL,
				VenueOneOf: { case: 'Physical', value: makeDefaultPhysical() },
			});
		}
	}

	return (
		<UIField>
			<FieldLabel>{label}</FieldLabel>
			<div className="flex justify-end mb-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
				>
					Add Venue
				</Button>
			</div>

			{venues.length === 0 ? (
				<div className="rounded border p-4 text-sm text-muted-foreground">
					No venues added. Click Add Venue to begin.
				</div>
			) : (
				<Accordion
					type="multiple"
					className="w-full space-y-3"
				>
					{venues.map((v, i) => (
						<AccordionItem
							key={v.VenueId || i}
							value={`venue-${i}`}
							className="rounded-lg border"
						>
							<AccordionTrigger className="group flex w-full items-center justify-between px-3 py-3 hover:no-underline">
								<div className="flex items-center gap-3">
									<span className="font-medium">
										{v.VenueOneOf.case === 'Physical'
											? v.VenueOneOf.value?.Name || `Physical Venue ${i + 1}`
											: v.VenueOneOf.case === 'Virtual'
											? v.VenueOneOf.value?.Name || `Virtual Venue ${i + 1}`
											: `Venue ${i + 1}`}
										<span className="text-muted-foreground font-normal">
											{' '}
											• {v.VenueId}
										</span>
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-3 pb-4">
								<div className="mb-3 flex justify-end">
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => remove(i)}
									>
										Delete venue
									</Button>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="grid gap-2">
										<Label>Type</Label>
										<Select
											value={String(v.OneOfType)}
											onValueChange={(val) => onChangeType(i, val)}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem
													value={String(
														EventVenueOneOfType.VENUE_ONE_OF_PHYSICAL
													)}
												>
													Physical
												</SelectItem>
												<SelectItem
													value={String(
														EventVenueOneOfType.VENUE_ONE_OF_VIRTUAL
													)}
												>
													Virtual
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid gap-2">
										<Label>Venue ID</Label>
										<Input
											value={v.VenueId}
											readOnly
											disabled
										/>
									</div>
								</div>

								{v.VenueOneOf.case === 'Physical' ? (
									<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
										<div className="grid gap-2">
											<Label>Name</Label>
											<Input
												value={v.VenueOneOf.value?.Name ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																Name: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Address</Label>
											<Input
												value={v.VenueOneOf.value?.Address ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																Address: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>City</Label>
											<Input
												value={v.VenueOneOf.value?.City ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																City: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>State/Province</Label>
											<Input
												value={v.VenueOneOf.value?.StateOrProvince ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																StateOrProvince: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Postal Code</Label>
											<Input
												value={v.VenueOneOf.value?.PostalCode ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																PostalCode: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Country</Label>
											<Input
												value={v.VenueOneOf.value?.Country ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																Country: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Phone</Label>
											<Input
												value={v.VenueOneOf.value?.PhoneNumber ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																PhoneNumber: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Email</Label>
											<Input
												value={v.VenueOneOf.value?.EmailAddress ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Physical',
															value: {
																...(v.VenueOneOf.value as any),
																EmailAddress: e.target.value,
															},
														},
													})
												}
											/>
										</div>
									</div>
								) : v.VenueOneOf.case === 'Virtual' ? (
									<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
										<div className="grid gap-2">
											<Label>Name</Label>
											<Input
												value={v.VenueOneOf.value?.Name ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Virtual',
															value: {
																...(v.VenueOneOf.value as any),
																Name: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Url</Label>
											<Input
												value={v.VenueOneOf.value?.Url ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Virtual',
															value: {
																...(v.VenueOneOf.value as any),
																Url: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2 md:col-span-2">
											<Label>Access Instructions</Label>
											<Input
												value={v.VenueOneOf.value?.AccessInstructions ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Virtual',
															value: {
																...(v.VenueOneOf.value as any),
																AccessInstructions: e.target.value,
															},
														},
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label>Contact Email</Label>
											<Input
												value={v.VenueOneOf.value?.ContactEmailAddress ?? ''}
												onChange={(e) =>
													update(i, {
														VenueOneOf: {
															case: 'Virtual',
															value: {
																...(v.VenueOneOf.value as any),
																ContactEmailAddress: e.target.value,
															},
														},
													})
												}
											/>
										</div>
									</div>
								) : null}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</UIField>
	);
}

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
import { Switch } from '@/components/ui/switch';
import { centsToCurrency } from './utils';
import { v4 as uuid } from 'uuid';
import { EventTicketClassType } from '@inverted-tech/fragments/Authorization/Events/index';

type TicketClass = {
	TicketClassId: string;
	Type: EventTicketClassType;
	Name: string;
	AmountAvailable: number;
	CountTowardEventMax: boolean;
	MaxTicketsPerUser: number;
	IsTransferrable: boolean;
	PricePerTicketCents: number;
};

const makeDefaultTicketClass = (): TicketClass => ({
	TicketClassId: uuid(),
	Type: EventTicketClassType.TICKET_GENERAL_ACCESS,
	Name: '',
	AmountAvailable: 0,
	CountTowardEventMax: true,
	MaxTicketsPerUser: 0,
	IsTransferrable: true,
	PricePerTicketCents: 0,
});

export function TicketClassesField({
	label = 'Ticket Classes',
	description = 'Define ticket types, availability, and pricing.',
}: {
	label?: string;
	description?: string;
}) {
	const field = useFieldContext<TicketClass[] | undefined>();
	const classes = field.state.value ?? [];

	function update(idx: number, patch: Partial<TicketClass>) {
		const copy = [...classes];
		copy[idx] = { ...copy[idx], ...patch } as TicketClass;
		field.handleChange(copy);
	}

	function remove(idx: number) {
		const copy = [...classes];
		copy.splice(idx, 1);
		field.handleChange(copy);
	}

	function add() {
		field.handleChange([
			...(classes as TicketClass[]),
			makeDefaultTicketClass(),
		]);
	}

	function typeToLabel(t: EventTicketClassType) {
		switch (t) {
			case EventTicketClassType.TICKET_GENERAL_ACCESS:
				return 'General Access';
			case EventTicketClassType.TICKET_ALL_MEMBER_ACCESS:
				return 'All Member Access';
			case EventTicketClassType.TICKET_MEMBER_LEVEL_ACCESS:
				return 'Member Level Access';
			default:
				return String(t);
		}
	}

	return (
		<UIField>
			<FieldLabel>{label}</FieldLabel>
			<div className="mb-2 text-sm text-muted-foreground">{description}</div>

			<div className="flex justify-end mb-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
				>
					Add Ticket Class
				</Button>
			</div>

			{classes.length === 0 ? (
				<div className="rounded border p-4 text-sm text-muted-foreground">
					No ticket classes. Click Add Ticket Class to begin.
				</div>
			) : (
				<Accordion
					type="multiple"
					className="w-full space-y-3"
				>
					{classes.map((c, i) => (
						<AccordionItem
							key={c.TicketClassId || i}
							value={`ticket-${i}`}
							className="rounded-lg border"
						>
							<AccordionTrigger className="group flex w-full items-center justify-between px-3 py-3 hover:no-underline">
								<div className="flex items-center gap-3">
									<span className="font-medium">
										{c.Name || `Ticket Class ${i + 1}`}{' '}
										<span className="text-muted-foreground font-normal">
											• {typeToLabel(c.Type)} •{' '}
											{centsToCurrency(c.PricePerTicketCents || 0)}
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
										Delete class
									</Button>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="grid gap-2">
										<Label>Name</Label>
										<Input
											value={c.Name}
											onChange={(e) => update(i, { Name: e.target.value })}
											placeholder="General Admission, VIP, etc."
										/>
									</div>

									<div className="grid gap-2">
										<Label>Type</Label>
										<Select
											value={String(c.Type)}
											onValueChange={(val) =>
												update(i, { Type: Number(val) as EventTicketClassType })
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem
													value={String(
														EventTicketClassType.TICKET_GENERAL_ACCESS
													)}
												>
													General Access
												</SelectItem>
												<SelectItem
													value={String(
														EventTicketClassType.TICKET_ALL_MEMBER_ACCESS
													)}
												>
													All Member Access
												</SelectItem>
												<SelectItem
													value={String(
														EventTicketClassType.TICKET_MEMBER_LEVEL_ACCESS
													)}
												>
													Member Level Access
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid gap-2">
										<Label>Price (cents)</Label>
										<div className="relative">
											<Input
												type="number"
												value={String(c.PricePerTicketCents ?? 0)}
												onChange={(e) =>
													update(i, {
														PricePerTicketCents: Number(e.target.value) || 0,
													})
												}
												className="pr-20"
											/>
											<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
												{centsToCurrency(c.PricePerTicketCents || 0)}
											</span>
										</div>
									</div>

									<div className="grid gap-2">
										<Label>Amount Available</Label>
										<Input
											type="number"
											value={String(c.AmountAvailable ?? 0)}
											onChange={(e) =>
												update(i, {
													AmountAvailable: Number(e.target.value) || 0,
												})
											}
										/>
									</div>

									<div className="grid gap-2">
										<Label>Max Tickets Per User</Label>
										<Input
											type="number"
											value={String(c.MaxTicketsPerUser ?? 0)}
											onChange={(e) =>
												update(i, {
													MaxTicketsPerUser: Number(e.target.value) || 0,
												})
											}
										/>
									</div>

									<div className="grid gap-2">
										<Label className="flex items-center gap-2">
											<Switch
												checked={!!c.CountTowardEventMax}
												onCheckedChange={(val) =>
													update(i, { CountTowardEventMax: Boolean(val) })
												}
											/>
											Count Toward Event Max
										</Label>
									</div>

									<div className="grid gap-2">
										<Label className="flex items-center gap-2">
											<Switch
												checked={!!c.IsTransferrable}
												onCheckedChange={(val) =>
													update(i, { IsTransferrable: Boolean(val) })
												}
											/>
											Is Transferrable
										</Label>
									</div>

									<div className="grid gap-2">
										<Label>Ticket Class ID</Label>
										<Input
											value={c.TicketClassId}
											readOnly
											disabled
										/>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</UIField>
	);
}

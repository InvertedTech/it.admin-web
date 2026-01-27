'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import {
	PaymentStatus,
	SubscriptionStatus,
	type GenericPaymentRecord,
	type GenericSubscriptionFullRecord,
} from '@inverted-tech/fragments/Authorization/Payment/index';

const subscriptionStatusMap = {
	Subscription_Unknown: { label: 'Unknown', variant: 'secondary' },
	Subscription_Pending: { label: 'Pending', variant: 'secondary' },
	Subscription_Active: { label: 'Active', variant: 'default' },
	Subscription_Stopped: { label: 'Stopped', variant: 'destructive' },
	Subscription_Paused: { label: 'Paused', variant: 'outline' },
} as const;

const paymentStatusMap = {
	Payment_Unknown: { label: 'Unknown', variant: 'secondary' },
	Payment_Pending: { label: 'Pending', variant: 'secondary' },
	Payment_Complete: { label: 'Complete', variant: 'default' },
	Payment_Failed: { label: 'Failed', variant: 'destructive' },
	Payment_Refunded: { label: 'Refunded', variant: 'outline' },
} as const;

function centsToCurrency(cents?: number) {
	if (typeof cents !== 'number') return '-';
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
		}).format(cents / 100);
	} catch {
		return `$${(cents / 100).toFixed(2)}`;
	}
}

type MaybeTimestamp = unknown;
function toJsDate(value: MaybeTimestamp): Date | undefined {
	if (!value) return;
	if (value instanceof Date) return value;
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
	if (typeof value === 'object' && value && 'seconds' in (value as any)) {
		const s = Number((value as any).seconds ?? 0);
		const n = Number((value as any).nanos ?? 0);
		const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
		return Number.isNaN(d.getTime()) ? undefined : d;
	}
}

function fmtDate(v?: MaybeTimestamp) {
	const d = v ? toJsDate(v) : undefined;
	return d ? d.toLocaleString() : '-';
}

function subscriptionStatusMeta(status?: unknown) {
	if (typeof status === 'string') {
		return (
			subscriptionStatusMap[
				status as keyof typeof subscriptionStatusMap
			] ?? subscriptionStatusMap.Subscription_Unknown
		);
	}
	if (typeof status === 'number') {
		switch (status) {
			case SubscriptionStatus.Subscription_Active:
				return subscriptionStatusMap.Subscription_Active;
			case SubscriptionStatus.Subscription_Pending:
				return subscriptionStatusMap.Subscription_Pending;
			case SubscriptionStatus.Subscription_Paused:
				return subscriptionStatusMap.Subscription_Paused;
			case SubscriptionStatus.Subscription_Stopped:
				return subscriptionStatusMap.Subscription_Stopped;
			default:
				return subscriptionStatusMap.Subscription_Unknown;
		}
	}
	return subscriptionStatusMap.Subscription_Unknown;
}

function paymentStatusMeta(status?: unknown) {
	if (typeof status === 'string') {
		return (
			paymentStatusMap[status as keyof typeof paymentStatusMap] ??
			paymentStatusMap.Payment_Unknown
		);
	}
	if (typeof status === 'number') {
		switch (status) {
			case PaymentStatus.Payment_Complete:
				return paymentStatusMap.Payment_Complete;
			case PaymentStatus.Payment_Pending:
				return paymentStatusMap.Payment_Pending;
			case PaymentStatus.Payment_Refunded:
				return paymentStatusMap.Payment_Refunded;
			case PaymentStatus.Payment_Failed:
				return paymentStatusMap.Payment_Failed;
			default:
				return paymentStatusMap.Payment_Unknown;
		}
	}
	return paymentStatusMap.Payment_Unknown;
}

function SummaryRow({
	label,
	value,
}: {
	label: string;
	value: string | number | undefined;
}) {
	return (
		<div className='flex items-start justify-between gap-4 border-b pb-2 text-sm last:border-b-0'>
			<span className='text-muted-foreground'>{label}</span>
			<span className='text-right'>{value ?? '-'}</span>
		</div>
	);
}

type GenericSubscriptionLike = GenericSubscriptionFullRecord & {
	SubscriptionRecord?: GenericSubscriptionFullRecord['SubscriptionRecord'] & {
		Status?: unknown;
	};
	Payments?: (GenericPaymentRecord & { Status?: unknown })[];
	LastPaidUTC?: unknown;
	PaidThruUTC?: unknown;
	RenewsOnUTC?: unknown;
};

function PaymentCard({
	payment,
}: {
	payment: GenericPaymentRecord & { Status?: unknown };
}) {
	const status = paymentStatusMeta(payment.Status);
	return (
		<Card>
			<CardContent className='space-y-3 pt-4'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div>
						<div className='text-sm font-medium'>
							{payment.InternalPaymentID || 'Payment'}
						</div>
						<div className='text-xs text-muted-foreground'>
							{fmtDate(payment.CreatedOnUTC)}
						</div>
					</div>
					<Badge variant={status.variant}>{status.label}</Badge>
				</div>
				<div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-3'>
					<div>
						<div className='text-xs text-muted-foreground'>
							Amount
						</div>
						<div>{centsToCurrency(payment.AmountCents)}</div>
					</div>
					<div>
						<div className='text-xs text-muted-foreground'>Tax</div>
						<div>{centsToCurrency(payment.TaxCents)}</div>
					</div>
					<div>
						<div className='text-xs text-muted-foreground'>
							Total
						</div>
						<div>{centsToCurrency(payment.TotalCents)}</div>
					</div>
				</div>
				<div className='grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2'>
					<div>Paid: {fmtDate(payment.PaidOnUTC)}</div>
					<div>Paid Thru: {fmtDate(payment.PaidThruUTC)}</div>
					<div>
						Processor Payment ID:{' '}
						{payment.ProcessorPaymentID || '-'}
					</div>
					<div>Created By: {payment.CreatedBy || '-'}</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SubscriptionItem({
	item,
	index,
}: {
	item: GenericSubscriptionLike;
	index: number;
}) {
	const record = item.SubscriptionRecord;
	const status = subscriptionStatusMeta(record?.Status);
	const payments = item.Payments ?? [];
	const title = record?.InternalSubscriptionID || `Subscription ${index + 1}`;

	return (
		<AccordionItem value={`sub-${index}`}>
			<AccordionTrigger>
				<div className='flex flex-1 flex-wrap items-start justify-between gap-4'>
					<div className='space-y-1'>
						<div className='text-sm font-medium'>{title}</div>
						<div className='text-xs text-muted-foreground'>
							{record?.ProcessorName || '-'} �{' '}
							{centsToCurrency(record?.AmountCents)}
						</div>
					</div>
					<Badge variant={status.variant}>{status.label}</Badge>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className='space-y-6'>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='space-y-2 rounded-lg border p-4'>
							<div className='text-sm font-medium'>
								Subscription Details
							</div>
							<SummaryRow
								label='Processor Customer ID'
								value={record?.ProcessorCustomerID || '-'}
							/>
							<SummaryRow
								label='Processor Subscription ID'
								value={record?.ProcessorSubscriptionID || '-'}
							/>
							<SummaryRow
								label='Total'
								value={centsToCurrency(record?.TotalCents)}
							/>
							<SummaryRow
								label='Tax'
								value={centsToCurrency(record?.TaxCents)}
							/>
							<SummaryRow
								label='Created'
								value={fmtDate(record?.CreatedOnUTC)}
							/>
							<SummaryRow
								label='Modified'
								value={fmtDate(record?.ModifiedOnUTC)}
							/>
							<SummaryRow
								label='Canceled'
								value={fmtDate(record?.CanceledOnUTC)}
							/>
						</div>
						<div className='space-y-2 rounded-lg border p-4'>
							<div className='text-sm font-medium'>
								Billing Timeline
							</div>
							<SummaryRow
								label='Last Paid'
								value={fmtDate(item.LastPaidUTC)}
							/>
							<SummaryRow
								label='Paid Thru'
								value={fmtDate(item.PaidThruUTC)}
							/>
							<SummaryRow
								label='Renews On'
								value={fmtDate(item.RenewsOnUTC)}
							/>
						</div>
					</div>

					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<div className='text-sm font-medium'>Payments</div>
							<div className='text-xs text-muted-foreground'>
								{payments.length} total
							</div>
						</div>
						{payments.length ? (
							<div className='space-y-3'>
								{payments.map((payment, idx) => (
									<PaymentCard
										key={`${payment.InternalPaymentID}-${idx}`}
										payment={payment}
									/>
								))}
							</div>
						) : (
							<div className='text-sm text-muted-foreground'>
								No payments recorded.
							</div>
						)}
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

export function UserSubscriptions({
	subscriptions,
}: {
	subscriptions?: {
		Generic?:
			| GenericSubscriptionFullRecord[]
			| GenericSubscriptionFullRecord;
	};
}) {
	const genericList = Array.isArray(subscriptions?.Generic)
		? (subscriptions?.Generic as GenericSubscriptionLike[])
		: subscriptions?.Generic
			? ([subscriptions.Generic] as GenericSubscriptionLike[])
			: [];

	if (!genericList.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Subscriptions</CardTitle>
					<CardDescription>Generic subscription records</CardDescription>
				</CardHeader>
				<CardContent>
					<Empty className='border'>
						<EmptyHeader>
							<EmptyTitle>No subscriptions</EmptyTitle>
							<EmptyDescription>
								This user has no subscription records yet.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Subscriptions</CardTitle>
				<CardDescription>Generic subscription records</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type='multiple' className='space-y-2'>
					{genericList.map((item, index) => (
						<SubscriptionItem
							key={`sub-${index}`}
							item={item}
							index={index}
						/>
					))}
				</Accordion>
			</CardContent>
		</Card>
	);
}





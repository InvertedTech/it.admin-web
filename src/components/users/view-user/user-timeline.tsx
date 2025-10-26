'use client';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';

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
	return d ? d.toLocaleString() : '—';
}

export function UserTimeline({
	createdOn,
	modifiedOn,
	disabledOn,
}: {
	createdOn: unknown;
	modifiedOn?: unknown;
	disabledOn?: unknown;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Timeline</CardTitle>
				<CardDescription>Key timestamps</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Created</div>
						<div className="mt-1">{fmtDate(createdOn)}</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Modified</div>
						<div className="mt-1">{fmtDate(modifiedOn)}</div>
					</div>
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Disabled</div>
						<div className="mt-1">{fmtDate(disabledOn)}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

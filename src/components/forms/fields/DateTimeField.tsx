'use client';
import React from 'react';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { parseDate } from 'chrono-node';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from './utils';

function toDate(v: any): Date | undefined {
	try {
		if (!v) return;
		if (v instanceof Date) return v;
		if (typeof v === 'string') {
			const d = parseDate(v) || new Date(v);
			return d instanceof Date && !Number.isNaN(d.getTime())
				? d
				: undefined;
		}
		if (typeof v === 'object' && v.seconds != null) {
			const s = Number(v.seconds ?? 0);
			const n = Number(v.nanos ?? 0);
			const ms = s * 1000 + Math.floor(n / 1_000_000);
			const d = new Date(ms);
			return !Number.isNaN(d.getTime()) ? d : undefined;
		}
	} catch {}
	return;
}
function toTimestamp(d?: Date): any {
	if (!d) return;
	const ms = d.getTime();
	return { seconds: Math.floor(ms / 1000), nanos: (ms % 1000) * 1_000_000 };
}
function fmtDate(d?: Date) {
	return d
		? d.toLocaleDateString('en-US', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
		  })
		: '';
}
function timeValue(d?: Date) {
	if (!d) return '';
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${hh}:${mm}`;
}

export function DateTimeField({
	label,
	placeholder = 'Tomorrow or next week',
}: {
	label?: React.ReactNode;
	placeholder?: string;
}) {
	const field = useFieldContext<any>();
	const form = useFormContext();

	const initial = toDate(field.state.value);
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(initial);
	const [month, setMonth] = React.useState<Date | undefined>(initial);
	const [text, setText] = React.useState<string>(fmtDate(initial));

	function commit(d?: Date) {
		if (!d) return;
		const ts = toTimestamp(d);
		if (ts) field.handleChange(ts);
	}

	return (
		<form.Subscribe
			selector={(s: any) => ({
				submit: s?.submitErrors,
				sync: s?.errors,
			})}
		>
			{(errState: any) => {
				const submitField =
					matchFieldErrors(
						errState?.submit?.fields as any,
						field.name
					) ?? [];
				const syncField =
					matchFieldErrors(
						errState?.sync?.fields as any,
						field.name
					) ?? [];
				const base = Array.isArray(field.state.meta.errors)
					? (field.state.meta.errors as any)
					: [];
				const errors =
					normalizeFieldErrors([
						...base,
						...submitField,
						...syncField,
					] as any) ?? [];
				const isInvalid = errors.length > 0;

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>

						<div className='relative flex gap-2'>
							<Input
								id={field.name}
								name={field.name}
								value={text}
								placeholder={placeholder}
								className='bg-background pr-10'
								onChange={(e) => {
									const val = e.target.value;
									setText(val);
									const d = parseDate(val) || undefined;
									if (d) {
										setDate(d);
										setMonth(d);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										commit(date);
									}
									if (e.key === 'ArrowDown') setOpen(true);
								}}
							/>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										type='button'
										variant='ghost'
										className='absolute top-1/2 right-2 size-6 -translate-y-1/2'
									>
										<CalendarIcon className='size-3.5' />
										<span className='sr-only'>
											Select date
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto overflow-hidden p-0'
									align='end'
								>
									<Calendar
										mode='single'
										selected={date}
										captionLayout='dropdown'
										month={month}
										onMonthChange={setMonth}
										onSelect={(d) => {
											setDate(d ?? undefined);
											if (d) {
												setText(fmtDate(d));
												commit(d);
											}
											setOpen(false);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className='mt-2 flex items-center gap-2'>
							<Input
								type='time'
								className='w-[9rem]'
								value={timeValue(date)}
								onChange={(e) => {
									const [hh, mm] = e.target.value
										.split(':')
										.map((x) => parseInt(x || '0', 10));
									const base = date ?? new Date();
									const d = new Date(base);
									d.setHours(
										Number.isFinite(hh) ? hh : 0,
										Number.isFinite(mm) ? mm : 0,
										0,
										0
									);
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							/>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									const d = new Date();
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							>
								Now
							</Button>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									const d = new Date();
									d.setHours(d.getHours() + 1, 0, 0, 0);
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							>
								+1 hour
							</Button>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									const d = new Date();
									d.setDate(d.getDate() + 1);
									d.setHours(9, 0, 0, 0);
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							>
								Tomorrow 9:00
							</Button>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									const d = new Date();
									const day = d.getDay();
									const delta = (1 - day + 7) % 7 || 7;
									d.setDate(d.getDate() + delta);
									d.setHours(9, 0, 0, 0);
									setDate(d);
									setMonth(d);
									setText(fmtDate(d));
									commit(d);
								}}
							>
								Next Mon 9:00
							</Button>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={() => {
									setDate(undefined);
									setText('');
									field.handleChange(undefined);
								}}
							>
								Clear
							</Button>
						</div>

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

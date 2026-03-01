import { useFieldContext, useFormContext } from '@/hooks/form-context';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { JobType } from '@inverted-tech/fragments/Careers';
import React, { useEffect } from 'react';
import { matchFieldErrors } from './utils';
import {
	Field as UIField,
	FieldLabel,
	FieldError,
} from '@/components/ui/field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type JobTypeString =
	| 'Contract'
	| 'Full-Time'
	| 'Hybrid'
	| 'Part-Time'
	| 'Remote';

export function JobTypeSelect({
	label,
	options = [],
	placeholder = 'Select type...',
	noneLabel = 'None',
}: {
	label?: React.ReactNode;
	options?: Array<{ display: string; jobType: JobType }>;
	placeholder?: string;
	noneLabel?: string;
}) {
	const field = useFieldContext<JobType | undefined>();
	const form = useFormContext();

	const getStringValue = (j: JobType) => {
		switch (j) {
			case JobType.CONTRACT:
				return 'Contract';
			case JobType.FULL_TIME:
				return 'Full-Time';
			case JobType.HYBRID:
				return 'Hybrid';
			case JobType.PART_TIME:
				return 'Part-Time';
			case JobType.REMOTE:
				return 'Remote';
			default:
				return 'Full-Time';
		}
	};

	const getJobTypeValue = (j: JobTypeString) => {
		switch (j) {
			case 'Contract':
				return JobType.CONTRACT;
			case 'Full-Time':
				return JobType.FULL_TIME;
			case 'Hybrid':
				return JobType.HYBRID;
			case 'Part-Time':
				return JobType.PART_TIME;
			case 'Remote':
				return JobType.REMOTE;
			default:
				return JobType.FULL_TIME;
		}
	};

	// Normalize string enum values that can arrive from proto3 JSON deserialization
	// (e.g. "FULL_TIME" instead of 0). Only runs on mount.
	useEffect(() => {
		if (typeof field.state.value !== 'number') {
			field.handleChange(
				getJobTypeValue(
					getStringValue(
						(field.state.value ?? JobType.FULL_TIME) as JobType,
					) as JobTypeString,
				),
			);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
						field.name,
					) ?? [];
				const syncField =
					matchFieldErrors(
						errState?.sync?.fields as any,
						field.name,
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

				const value = field.state.value ?? JobType.FULL_TIME;
				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Select
							value={getStringValue(value)}
							onValueChange={(v) => {
								field.handleChange(
									getJobTypeValue(v as JobTypeString),
								);
							}}
						>
							<SelectTrigger className='h-8 w-[88px]'>
								<SelectValue
									defaultValue={value}
									id={field.name}
									aria-invalid={isInvalid}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value={getStringValue(JobType.FULL_TIME)}
								>
									Full-Time
								</SelectItem>
								<SelectItem
									value={getStringValue(JobType.CONTRACT)}
								>
									Contract
								</SelectItem>
								<SelectItem
									value={getStringValue(JobType.PART_TIME)}
								>
									Part-Time
								</SelectItem>
								<SelectItem
									value={getStringValue(JobType.REMOTE)}
								>
									Remote
								</SelectItem>
								<SelectItem
									value={getStringValue(JobType.HYBRID)}
								>
									Hybrid
								</SelectItem>
							</SelectContent>
						</Select>

						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

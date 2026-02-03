'use client';

import React from 'react';
import { withFieldGroup } from '@/hooks/use-proto-app-form';
import {
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
} from '@/components/ui/field';
import { create } from '@bufbuild/protobuf';
import {
	CommentsPrivateRecordSchema,
	CommentsPublicRecordSchema,
} from '@inverted-tech/fragments/Settings';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// enums as strings from your zod example / proto
const ORDER_OPTS = ['NewestFirst', 'OldestFirst', 'Top'] as const;
const RESTRICTION_MIN_OPTS = [
	'Anonymous',
	'Subscriber',
	'PaidSubscriber',
	'CommentModerator',
	'AdminOnly',
] as const;

export const CommentPublicSettingsFieldGroup = withFieldGroup({
	props: { title: '' },
	defaultValues: create(CommentsPublicRecordSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				{/* AllowLinks */}
				<group.AppField name="AllowLinks">
					{(f) => <f.SwitchField label="Allow Links" />}
				</group.AppField>

				{/* DefaultOrder */}
				<group.AppField name="DefaultOrder">
					{(field) => (
						<div className="grid gap-1.5">
							<FieldLabel>Default Order</FieldLabel>
							<Select
								value={String(field.state.value ?? '')}
								onValueChange={(v) => field.handleChange(v as any)}
							>
								<SelectTrigger className="w-[260px]">
									<SelectValue placeholder="Choose order" />
								</SelectTrigger>
								<SelectContent>
									{ORDER_OPTS.map((o) => (
										<SelectItem
											key={o}
											value={o}
										>
											{o === 'NewestFirst'
												? 'Newest first'
												: o === 'OldestFirst'
												? 'Oldest first'
												: 'Top (ranked)'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Initial sort for comment threads.
							</FieldDescription>
							<FieldError />
						</div>
					)}
				</group.AppField>

				{/* DefaultRestriction.Minimum */}
				<group.AppField name="DefaultRestriction.Minimum">
					{(field) => (
						<div className="grid gap-1.5">
							<FieldLabel>Minimum Participation Level</FieldLabel>
							<Select
								value={String(field.state.value ?? '')}
								onValueChange={(v) => field.handleChange(v as any)}
							>
								<SelectTrigger className="w-[300px]">
									<SelectValue placeholder="Choose minimum role" />
								</SelectTrigger>
								<SelectContent>
									{RESTRICTION_MIN_OPTS.map((v) => (
										<SelectItem
											key={v}
											value={v}
										>
											{v}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Minimum role required to post or interact.
							</FieldDescription>
							<FieldError />
						</div>
					)}
				</group.AppField>

				{/* DefaultRestriction.Level */}
				<group.AppField name="DefaultRestriction.Level">
					{(field) => {
						const val = Number(field.state.value ?? 0);
						const err = Number.isNaN(val)
							? 'Enter a number'
							: val < 0
							? 'Min 0'
							: val > 5
							? 'Max 5'
							: '';
						return (
							<div className="grid gap-1.5 max-w-[260px]">
								<FieldLabel>Level</FieldLabel>
								<Input
									type="number"
									inputMode="decimal"
									step="0.1"
									value={String(field.state.value ?? 0)}
									onChange={(e) => field.handleChange(Number(e.target.value))}
								/>
								{err ? (
									<div className="text-destructive text-sm">{err}</div>
								) : (
									<FieldDescription>
										Optional 0–5 threshold. Use 0 to disable.
									</FieldDescription>
								)}
								<FieldError />
							</div>
						);
					}}
				</group.AppField>

				{/* ExplicitModeEnabled */}
				<group.AppField name="ExplicitModeEnabled">
					{(f) => <f.SwitchField label="Allow Explicit Comments" />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

export const CommentPrivateSettingsFieldGroup = withFieldGroup({
	props: { title: '', suggestions: [] as string[] },
	defaultValues: create(CommentsPrivateRecordSchema),
	render: function Render({ group, title, suggestions }) {
		const hasTitle = title && title !== '';
		return (
			<FieldGroup>
				{hasTitle && <FieldLegend>{title}</FieldLegend>}

				<group.AppField name="BlackList">
					{(f) => (
						<f.MultiSelectField
							label="Moderation Blacklist"
							options={Array.isArray(suggestions) ? suggestions : []}
							placeholder="Add or select terms…"
						/>
					)}
				</group.AppField>
			</FieldGroup>
		);
	},
});

export default {
	CommentPublicSettingsFieldGroup,
	CommentPrivateSettingsFieldGroup,
};

'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/* ===========================
   Schemas & Types
   =========================== */

const CommentOrderEnum = z.enum(['NewestFirst', 'OldestFirst', 'Top']);
type CommentOrder = z.infer<typeof CommentOrderEnum>;

const CommentRestrictionMinimumEnum = z.enum([
	'Anonymous',
	'Subscriber',
	'PaidSubscriber',
	'CommentModerator',
	'AdminOnly',
]);

const CommentsPublicSchema = z.object({
	AllowLinks: z.boolean(),
	DefaultOrder: CommentOrderEnum,
	DefaultRestriction: z.object({
		Minimum: CommentRestrictionMinimumEnum,
		Level: z.number().min(0, 'Min 0').max(5, 'Max 5'),
	}),
	ExplicitModeEnabled: z.boolean(),
});
type CommentsPublicRecord = z.infer<typeof CommentsPublicSchema>;

const CommentsPrivateSchema = z.object({
	BlackList: z.array(z.string().min(1, 'Cannot add empty term')),
});
type CommentsPrivateRecord = z.infer<typeof CommentsPrivateSchema>;

/* ===========================
   Mock loaders & savers (replace with API)
   =========================== */

async function loadPublicSettings(): Promise<CommentsPublicRecord> {
	return {
		AllowLinks: true,
		DefaultOrder: 'NewestFirst',
		DefaultRestriction: { Minimum: 'Anonymous', Level: 0 },
		ExplicitModeEnabled: false,
	};
}
async function savePublicSettings(values: CommentsPublicRecord) {
	await new Promise((r) => setTimeout(r, 400));
	return values;
}

async function loadPrivateSettings(): Promise<CommentsPrivateRecord> {
	return { BlackList: ['spam', 'scam', 'rudeword'] };
}
async function savePrivateSettings(values: CommentsPrivateRecord) {
	await new Promise((r) => setTimeout(r, 400));
	return values;
}

/* ===========================
   Public Settings (TanStack Form)
   =========================== */

function CommentsSettingsPublic() {
	// 1) Always create the form (static defaults)
	const form = useForm({
		defaultValues: {
			AllowLinks: false,
			DefaultOrder: 'NewestFirst',
			DefaultRestriction: { Minimum: 'Anonymous', Level: 0 },
			ExplicitModeEnabled: false,
		},
		onSubmit: async ({ value }) => {
			const parsed = CommentsPublicSchema.safeParse(value);
			if (!parsed.success) {
				toast.error('Please fix the errors before saving.');
				return;
			}
			toast.promise(savePublicSettings(parsed.data), {
				loading: 'Saving public settings…',
				success: 'Public settings saved',
				error: 'Failed to save',
			});
		},
	});

	// 2) Load + hydrate (never change hook order)
	const [loading, setLoading] = React.useState(true);
	React.useEffect(() => {
		let alive = true;
		(async () => {
			const data = await loadPublicSettings();
			if (!alive) return;
			form.setFieldValue('AllowLinks', data.AllowLinks);
			form.setFieldValue('DefaultOrder', data.DefaultOrder);
			form.setFieldValue(
				'DefaultRestriction.Minimum',
				data.DefaultRestriction.Minimum
			);
			form.setFieldValue(
				'DefaultRestriction.Level',
				data.DefaultRestriction.Level
			);
			form.setFieldValue('ExplicitModeEnabled', data.ExplicitModeEnabled);
			setLoading(false);
		})();
		return () => {
			alive = false;
		};
	}, [form]);

	const orderOptions: CommentOrder[] = ['NewestFirst', 'OldestFirst', 'Top'];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Comments — Public Settings</CardTitle>
				<CardDescription>
					{loading
						? 'Loading…'
						: 'Default behavior visible to site visitors and members.'}
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<form.Field name='AllowLinks'>
					{(field) => (
						<div className='flex items-center justify-between opacity-100'>
							<div className='space-y-1'>
								<Label>Allow Links</Label>
								<p className='text-muted-foreground text-sm'>
									Users can include URLs in comments.
								</p>
							</div>
							<Switch
								disabled={loading}
								checked={field.state.value}
								onCheckedChange={(v) => field.handleChange(v)}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name='DefaultOrder'>
					{(field) => (
						<div className='grid gap-2'>
							<Label htmlFor='default-order'>Default Order</Label>
							<Select
								disabled={loading}
								value={field.state.value}
								onValueChange={(v) =>
									field.handleChange(v as CommentOrder)
								}
							>
								<SelectTrigger
									id='default-order'
									className='w-[240px]'
								>
									<SelectValue placeholder='Choose order' />
								</SelectTrigger>
								<SelectContent>
									{orderOptions.map((o) => (
										<SelectItem key={o} value={o}>
											{o === 'NewestFirst' &&
												'Newest first'}
											{o === 'OldestFirst' &&
												'Oldest first'}
											{o === 'Top' && 'Top (ranked)'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className='text-muted-foreground text-sm'>
								Initial sort for comment threads.
							</p>
						</div>
					)}
				</form.Field>

				<form.Field name='DefaultRestriction.Minimum'>
					{(field) => (
						<div className='grid gap-2'>
							<Label htmlFor='restriction-min'>
								Minimum Participation Level
							</Label>
							<Select
								disabled={loading}
								value={field.state.value}
								onValueChange={(v) =>
									field.handleChange(
										v as z.infer<
											typeof CommentRestrictionMinimumEnum
										>
									)
								}
							>
								<SelectTrigger
									id='restriction-min'
									className='w-[260px]'
								>
									<SelectValue placeholder='Choose minimum role' />
								</SelectTrigger>
								<SelectContent>
									{CommentRestrictionMinimumEnum.options.map(
										(v) => (
											<SelectItem key={v} value={v}>
												{v}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
							<p className='text-muted-foreground text-sm'>
								Minimum role required to post or interact in
								comments.
							</p>
						</div>
					)}
				</form.Field>

				<form.Field name='DefaultRestriction.Level'>
					{(field) => {
						const val = Number(field.state.value);
						const err = Number.isNaN(val)
							? 'Enter a number'
							: val < 0
							? 'Min 0'
							: val > 5
							? 'Max 5'
							: '';
						return (
							<div className='grid max-w-[260px] gap-2'>
								<Label htmlFor='restriction-level'>Level</Label>
								<Input
									id='restriction-level'
									type='number'
									inputMode='decimal'
									step='0.1'
									disabled={loading}
									value={String(field.state.value)}
									onChange={(e) =>
										field.handleChange(
											Number(e.target.value)
										)
									}
								/>
								{err ? (
									<p className='text-destructive text-sm'>
										{err}
									</p>
								) : (
									<p className='text-muted-foreground text-sm'>
										Optional 0–5 threshold. Use 0 to
										disable.
									</p>
								)}
							</div>
						);
					}}
				</form.Field>

				<form.Field name='ExplicitModeEnabled'>
					{(field) => (
						<div className='flex items-center justify-between'>
							<div className='space-y-1'>
								<Label>Explicit Mode</Label>
								<p className='text-muted-foreground text-sm'>
									Gate mature content behind user controls.
								</p>
							</div>
							<Switch
								disabled={loading}
								checked={field.state.value}
								onCheckedChange={(v) => field.handleChange(v)}
							/>
						</div>
					)}
				</form.Field>

				<div className='pt-2'>
					<Button
						onClick={() => form.handleSubmit()}
						disabled={loading}
					>
						Save Public Settings
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/* ===========================
   Private Settings (TanStack Form)
   =========================== */

function CommentsSettingsPrivate() {
	const form = useForm({
		defaultValues: { BlackList: [] as string[] },
		onSubmit: async ({ value }) => {
			const parsed = CommentsPrivateSchema.safeParse(value);
			if (!parsed.success) {
				toast.error('Please fix the errors before saving.');
				return;
			}
			toast.promise(savePrivateSettings(parsed.data), {
				loading: 'Saving private settings…',
				success: 'Private settings saved',
				error: 'Failed to save',
			});
		},
	});

	const [loading, setLoading] = React.useState(true);
	React.useEffect(() => {
		let alive = true;
		(async () => {
			const data = await loadPrivateSettings();
			if (!alive) return;
			form.setFieldValue('BlackList', data.BlackList);
			setLoading(false);
		})();
		return () => {
			alive = false;
		};
	}, [form]);

	// simple chip editor
	const [token, setToken] = React.useState('');
	const addToken = () => {
		const t = token.trim();
		if (!t) return;
		const list = form.state.values.BlackList ?? [];
		if (!list.includes(t)) form.setFieldValue('BlackList', [...list, t]);
		setToken('');
	};
	const removeToken = (t: string) => {
		const list = form.state.values.BlackList ?? [];
		form.setFieldValue(
			'BlackList',
			list.filter((x) => x !== t)
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Comments — Private Settings</CardTitle>
				<CardDescription>
					{loading
						? 'Loading…'
						: 'Moderation blacklist terms (server-only).'}
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='grid gap-2'>
					<Label htmlFor='blacklist'>Add to blacklist</Label>
					<div className='flex items-center gap-2'>
						<Input
							id='blacklist'
							placeholder='word or phrase'
							value={token}
							onChange={(e) => setToken(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addToken();
								}
							}}
							className='max-w-md'
							disabled={loading}
						/>
						<Button
							type='button'
							onClick={addToken}
							disabled={loading}
						>
							Add
						</Button>
					</div>
					<p className='text-muted-foreground text-sm'>
						These terms will be blocked or flagged by the moderation
						layer.
					</p>
				</div>

				<form.Field name='BlackList'>
					{(field) => (
						<div className='flex flex-wrap gap-2'>
							{field.state.value?.length ? null : (
								<span className='text-muted-foreground text-sm'>
									No blacklist terms yet.
								</span>
							)}
							{field.state.value?.map((t) => (
								<Badge
									key={t}
									variant='secondary'
									className='gap-2'
								>
									{t}
									<button
										type='button'
										className='text-muted-foreground/70 hover:text-foreground'
										onClick={() => removeToken(t)}
										aria-label={`Remove ${t}`}
									>
										×
									</button>
								</Badge>
							))}
						</div>
					)}
				</form.Field>

				<div className='pt-2'>
					<Button
						onClick={() => form.handleSubmit()}
						disabled={loading}
					>
						Save Private Settings
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/* ===========================
   Page Wrapper
   =========================== */

export default function CommentsSettingsPage() {
	return (
		<div className='container mx-auto space-y-6 py-8'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Comment Settings
				</h1>
				<p className='text-muted-foreground'>
					Control ordering, restrictions, and moderation rules.
				</p>
			</div>

			<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
				<CommentsSettingsPublic />
				<CommentsSettingsPrivate />
			</div>
		</div>
	);
}

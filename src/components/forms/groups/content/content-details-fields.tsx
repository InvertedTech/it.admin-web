'use client';

import React from 'react';
import { create } from '@bufbuild/protobuf';
import {
	SearchUsersAdminRequestSchema,
	type UserSearchRecord,
} from '@inverted-tech/fragments/Authentication';
import { getSessionUser, listUsers } from '@/app/actions/auth';
import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { useStore } from '@tanstack/react-form';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import {
	Field as UIField,
	FieldError,
	FieldLabel,
	FieldGroup,
} from '@/components/ui/field';
import { useFieldContext, useFormContext } from '@/hooks/form-context';
import { cn } from '@/lib/utils';
import { normalizeFieldErrors } from '@/hooks/use-proto-validation';
import { matchFieldErrors } from '@/components/forms/fields/utils';

// Group for basic content public details
type ChannelOption = { ChannelId?: string; DisplayName?: string };
type CategoryOption = { CategoryId?: string; DisplayName?: string };
type AuthorOption = { UserID?: string; UserName?: string };

const ContentDetailsFields = withFieldGroup({
	// Keys here define the fields required in the mapping when used
	defaultValues: {
		Title: '',
		Description: '',
		Author: '',
		URL: '',
		FeaturedImageAssetID: '',
		SubscriptionLevel: 0,
		Tags: [] as string[],
		ChannelIds: [] as string[],
		CategoryIds: [] as string[],
	},
	render: function Render({ group }) {
		// Load channels and categories for selectors
		const [channels, setChannels] = React.useState<ChannelOption[]>([]);
		const [categories, setCategories] = React.useState<CategoryOption[]>(
			[],
		);
		const [authors, setAuthors] = React.useState<AuthorOption[]>([]);
		const [loadingChannels, setLoadingChannels] =
			React.useState<boolean>(true);
		const [loadingCategories, setLoadingCategories] =
			React.useState<boolean>(true);
		const [loadingAuthors, setLoadingAuthors] =
			React.useState<boolean>(true);
		React.useEffect(() => {
			let mounted = true;
			setLoadingChannels(true);
			fetch('/api/cms/channels')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as ChannelOption[])
						: [];
					setChannels(list);
					setLoadingChannels(false);
				})
				.catch(() => {
					if (mounted) setLoadingChannels(false);
				});
			setLoadingCategories(true);
			fetch('/api/cms/categories')
				.then((r) => r.json())
				.then((j) => {
					if (!mounted) return;
					const list = Array.isArray(j?.Records)
						? (j.Records as CategoryOption[])
						: [];
					setCategories(list);
					setLoadingCategories(false);
				})
				.catch(() => {
					if (mounted) setLoadingCategories(false);
				});
			return () => {
				mounted = false;
			};
		}, []);

		React.useEffect(() => {
			let mounted = true;
			async function loadAuthors() {
				setLoadingAuthors(true);
				const req = create(SearchUsersAdminRequestSchema, {
					PageSize: 500,
					PageOffset: 0,
					IncludeDeleted: false,
					Roles: ['owner', 'con_writer', 'admin'],
				});
				const res = await listUsers(req);
				const all = Array.isArray(res?.Records)
					? (res.Records as UserSearchRecord[])
					: [];

				if (mounted) {
					setAuthors(all);
					setLoadingAuthors(false);
				}
			}

			loadAuthors().catch(() => {
				if (mounted) setLoadingAuthors(false);
			});

			return () => {
				mounted = false;
			};
		}, []);

		const channelOptions = React.useMemo(
			() =>
				channels.map((c) => ({
					ChannelId: String(c.ChannelId ?? ''),
					DisplayName: String(c.DisplayName ?? c.ChannelId ?? ''),
				})),
			[channels],
		);
		const categoryOptions = React.useMemo(
			() =>
				categories.map((c) => ({
					CategoryId: String(c.CategoryId ?? ''),
					DisplayName: String(c.DisplayName ?? c.CategoryId ?? ''),
				})),
			[categories],
		);
		const authorOptions = React.useMemo(
			() =>
				authors.map((a) => ({
					UserID: String(a.UserID ?? ''),
					UserName: String(a.UserName ?? a.UserID ?? ''),
				})),
			[authors],
		);

		// Slug preview next to Title
		return (
			<div className='grid gap-8 lg:grid-cols-12'>
				<div className='space-y-4 lg:col-span-7'>
					<div>
						<h3 className='text-base font-semibold'>Details</h3>
						<p className='text-muted-foreground text-sm'>
							Title, description, and author information.
						</p>
					</div>
					<FieldGroup className='grid gap-6'>
						<group.AppField name='Title'>
							{(f) => (
								<div>
									<f.TextField label={'Title'} />
									<group.Subscribe
										selector={(s: any) => s?.values?.Title}
									>
										{(title: string) => {
											const slug = slugify(title ?? '');
											return (
												<div className='text-muted-foreground mt-1 text-xs'>
													URL: /{slug}
												</div>
											);
										}}
									</group.Subscribe>
								</div>
							)}
						</group.AppField>
						<group.AppField name='Description'>
							{(f) => <f.TextField label={'Description'} />}
						</group.AppField>
						<group.AppField name='Author'>
							{() => (
								<AuthorSearchField
									label='Author'
									loading={loadingAuthors}
									options={authorOptions}
								/>
							)}
						</group.AppField>
					</FieldGroup>
				</div>
				<div className='space-y-4 lg:col-span-5'>
					<div>
						<h3 className='text-base font-semibold'>Metadata</h3>
						<p className='text-muted-foreground text-sm'>
							Images, access level, and organization.
						</p>
					</div>
					<FieldGroup className='grid gap-6'>
						{/* URL field hidden; preview is shown under Title */}
						<group.AppField name='FeaturedImageAssetID'>
							{(f) => (
								<f.ImagePickerField label={'Featured Image'} />
							)}
						</group.AppField>
						<group.AppField name='SubscriptionLevel'>
							{(f) => (
								<f.SubscriptionTierField
									label={'Subscription Tier'}
								/>
							)}
						</group.AppField>
						<group.AppField name='Tags'>
							{(f) => <f.MultiSelectField label={'Tags'} />}
						</group.AppField>
						<group.AppField name='ChannelIds'>
							{(f) => (
								<f.ChannelMultiSelectField
									label={'Channels'}
									options={channelOptions}
									loading={loadingChannels}
								/>
							)}
						</group.AppField>
						<group.AppField name='CategoryIds'>
							{(f) => (
								<f.CategoryMultiSelectField
									label={'Categories'}
									options={categoryOptions}
									loading={loadingCategories}
								/>
							)}
						</group.AppField>
					</FieldGroup>
				</div>
			</div>
		);
	},
});

export default ContentDetailsFields;

function slugify(input: string): string {
	return String(input)
		.toLowerCase()
		.trim()
		.replace(/[']/g, '')
		.replace(/\//g, '-')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function getIn(obj: any, path: string) {
	return path
		.split('.')
		.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function AuthorSearchField({
	label,
	options = [],
	loading = false,
}: {
	label?: React.ReactNode;
	options?: Array<{ UserID?: string; UserName?: string }>;
	loading?: boolean;
}) {
	const field = useFieldContext<string | undefined>();
	const form = useFormContext();
	const [open, setOpen] = React.useState(false);
	const authorIdFieldPath = 'Public.AuthorID';
	const authorIdFieldPathAlt = 'Public.AuthorId';
	const [sessionUser, setSessionUser] = React.useState<{
		id: string;
		userName: string;
		displayName: string;
	} | null>(null);
	const didInitRef = React.useRef(false);

	const authorId = useStore(
		form.store as any,
		(s: any) => getIn(s?.values, authorIdFieldPath) ?? '',
	);

	React.useEffect(() => {
		let mounted = true;
		getSessionUser()
			.then((u) => {
				if (!mounted) return;
				setSessionUser(u);
			})
			.catch(() => {
				if (mounted) setSessionUser(null);
			});
		return () => {
			mounted = false;
		};
	}, []);

	React.useEffect(() => {
		if (didInitRef.current) return;
		if (!sessionUser?.id) return;
		const currentName = (field.state.value ?? '').trim();
		if (currentName || authorId) return;
		const desiredName =
			sessionUser.displayName || sessionUser.userName || '';
		if (!desiredName) return;
		didInitRef.current = true;
		field.handleChange(desiredName);
		(form as any).setFieldValue(authorIdFieldPath, sessionUser.id);
		(form as any).setFieldValue(authorIdFieldPathAlt, sessionUser.id);
	}, [authorId, field, sessionUser]);

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

				const value = (field.state.value ?? '').trim();
				const selected =
					options.find((o) => (o.UserID ?? '') === authorId) ??
					options.find((o) => (o.UserName ?? '') === value);

				return (
					<UIField data-invalid={isInvalid}>
						<FieldLabel htmlFor={field.name}>
							{label ?? field.name}
						</FieldLabel>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									type='button'
									variant='outline'
									role='combobox'
									aria-expanded={open}
									className='w-full justify-between'
									disabled={loading}
								>
									{value
										? (selected?.UserName ?? value)
										: loading
											? 'Loading authors...'
											: 'Select author...'}
									<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
								<Command>
									<CommandInput placeholder='Search authors...' />
									<CommandList>
										<CommandEmpty>
											No authors found.
										</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value='__none__'
												onSelect={() => {
													field.handleChange('');
													(form as any).setFieldValue(
														authorIdFieldPath,
														'',
													);
													(form as any).setFieldValue(
														authorIdFieldPathAlt,
														'',
													);
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														'mr-2 h-4 w-4',
														!value
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
												None
											</CommandItem>
											{options.map((opt) => {
												const optId = opt.UserID ?? '';
												const optName =
													opt.UserName ?? optId;
												return (
													<CommandItem
														key={optId || optName}
														value={`${optName} ${optId}`.trim()}
														onSelect={() => {
															field.handleChange(
																optName,
															);
															(
																form as any
															).setFieldValue(
																authorIdFieldPath,
																optId,
															);
															(
																form as any
															).setFieldValue(
																authorIdFieldPathAlt,
																optId,
															);
															setOpen(false);
														}}
													>
														<CheckIcon
															className={cn(
																'mr-2 h-4 w-4',
																optId ===
																	authorId
																	? 'opacity-100'
																	: 'opacity-0',
															)}
														/>
														{optName}
													</CommandItem>
												);
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{isInvalid && <FieldError errors={errors} />}
					</UIField>
				);
			}}
		</form.Subscribe>
	);
}

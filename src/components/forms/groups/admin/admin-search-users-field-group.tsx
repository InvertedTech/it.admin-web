// src/components/forms/admin-search-users-groups.tsx
'use client';
import * as React from 'react';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { withFieldGroup } from '@/hooks/app-form';
import { useFormContext } from '@/hooks/form-context';
import { create } from '@bufbuild/protobuf';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';
import { RoleMeta, Roles as AllRoles } from '@/lib/roles';
import { AdminCreateUserForm } from '@/components/forms/admin-create-user-form';

export type RoleOption = { DisplayName: string; RoleValue: string };

const defaultRoleOptions: RoleOption[] = AllRoles.map((role) => ({
	DisplayName: RoleMeta[role]?.label ?? role,
	RoleValue: role,
}));

export function UsersFiltersButton({
	roles,
	canCreateUser,
	columnsButton,
}: {
	roles?: RoleOption[];
	canCreateUser?: boolean;
	columnsButton?: React.ReactNode;
}) {
	const form = useFormContext();
	const AppForm = form as any;
	const [open, setOpen] = React.useState(false);
	const roleOptions =
		Array.isArray(roles) && roles.length > 0 ? roles : defaultRoleOptions;

	return (
		<div className='flex-1 space-y-1'>
			{/* Inline toolbar row: search bar on the left, optional Create button */}
			<div className='flex items-end gap-2'>
				<div className='flex-1'>
					<AppForm.AppField name='SearchString'>
						{(f: any) => (
							<f.TextField label='Search' />
						)}
					</AppForm.AppField>
				</div>
				{canCreateUser && <CreateUserDialogButton />}
				{columnsButton}
			</div>

			{/* Collapsible filter row */}
			<Collapsible open={open} onOpenChange={setOpen}>
				<CollapsibleTrigger asChild>
					<button
						type='button'
						className='flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors'
					>
						<ChevronDown
							className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
						/>
						Filters
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent className='overflow-hidden data-[state=closed]:animate-none'>
					<div className='space-y-4 rounded-md border bg-card p-4 mt-1'>
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
							<div className='lg:col-span-2'>
								<AppForm.AppField name='Roles'>
									{(f: any) => (
										<f.RoleSelectField
											label='Roles'
											options={roleOptions}
										/>
									)}
								</AppForm.AppField>
							</div>
							<div className='lg:col-span-1'>
								<AppForm.AppField name='IncludeDeleted'>
									{(f: any) => (
										<f.SwitchField label='Include deleted' />
									)}
								</AppForm.AppField>
							</div>
							<div className='lg:col-span-1'>
								<AppForm.AppField name='PageSize'>
									{(f: any) => (
										<f.PageSizeField label='Page Size' value={25} />
									)}
								</AppForm.AppField>
							</div>
						</div>

						<div className='grid gap-4 md:grid-cols-2'>
							<AppForm.AppField name='CreatedAfter'>
								{(f: any) => <f.TextField label='Created after' />}
							</AppForm.AppField>
							<AppForm.AppField name='CreatedBefore'>
								{(f: any) => <f.TextField label='Created before' />}
							</AppForm.AppField>
						</div>

						<div className='flex items-center justify-end gap-2 pt-2'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => {
									AppForm.reset?.();
									AppForm.setFieldValue('PageOffset', 0);
								}}
							>
								Reset
							</Button>
							<Button
								type='button'
								size='sm'
								onClick={() => {
									AppForm.setFieldValue('PageOffset', 0);
									AppForm.handleSubmit();
									setOpen(false);
								}}
							>
								Apply
							</Button>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

function CreateUserDialogButton() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type='button'>Create</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Create User</DialogTitle>
				</DialogHeader>
				<AdminCreateUserForm />
			</DialogContent>
		</Dialog>
	);
}

export const AdminSearchUsersSearchBarFieldGroup = withFieldGroup({
	props: { roles: [] as RoleOption[] },
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group, roles }) {
		const roleOptions =
			Array.isArray(roles) && roles.length > 0
				? roles
				: defaultRoleOptions;

		return (
			<FieldGroup>
				<details
					className='rounded border p-3 [&>summary]:cursor-pointer'
					open
				>
					<summary className='text-sm text-muted-foreground'>
						Filters
					</summary>
					<div className='mt-3 space-y-4'>
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
							<div className='lg:col-span-1'>
								<group.AppField name='SearchString'>
									{(f) => <f.TextField label='Search' />}
								</group.AppField>
							</div>
							<div className='lg:col-span-2'>
								<group.AppField name='Roles'>
									{(f) => (
										<f.RoleSelectField
											label='Roles'
											options={roleOptions}
										/>
									)}
								</group.AppField>
							</div>
							<div className='lg:col-span-1'>
								<group.AppField name='IncludeDeleted'>
									{(f) => (
										<f.SwitchField label='Include deleted' />
									)}
								</group.AppField>
							</div>
						</div>

						<div className='grid gap-4 md:grid-cols-2'>
							<group.AppField name='CreatedAfter'>
								{(f) => <f.TextField label='Created after' />}
							</group.AppField>
							<group.AppField name='CreatedBefore'>
								{(f) => <f.TextField label='Created before' />}
							</group.AppField>
						</div>

						<div className='lg:col-span-1'>
							<group.AppField name='PageSize'>
								{(f) => (
									<f.PageSizeField
										label='Page Size'
										value={25}
									/>
								)}
							</group.AppField>
						</div>

						<div className='flex items-center justify-end gap-2 pt-2'>
							<button
								type='button'
								className='px-3 py-2 text-sm font-medium rounded border border-input hover:bg-accent'
								onClick={() => {
									(group as any).reset?.();
								}}
							>
								Reset Filters
							</button>
							<div>
								<group.CreateButton label='Apply Filters' />
							</div>
						</div>
					</div>
				</details>
			</FieldGroup>
		);
	},
});

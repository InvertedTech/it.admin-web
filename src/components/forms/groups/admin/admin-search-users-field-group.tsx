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
} from '@/components/ui/dialog';
import { withFieldGroup } from '@/hooks/app-form';
import { useFormContext } from '@/hooks/form-context';
import { create } from '@bufbuild/protobuf';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';
import { RoleMeta, Roles as AllRoles } from '@/lib/types';

export type RoleOption = { DisplayName: string; RoleValue: string };

const defaultRoleOptions: RoleOption[] = AllRoles.map((role) => ({
	DisplayName: RoleMeta[role]?.label ?? role,
	RoleValue: role,
}));

// Separate component for the Filters button to be used in table headers
export function UsersFiltersButton({ roles }: { roles?: RoleOption[] }) {
	const form = useFormContext();
	const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
	const roleOptions =
		Array.isArray(roles) && roles.length > 0 ? roles : defaultRoleOptions;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={() => setFilterDialogOpen(true)}
			>
				Filters
			</Button>

			{/* TODO: Experiment with shadcn Sheet component for better mobile/spacing experience */}
			<Dialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
			>
				<DialogContent className="max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Search Filters</DialogTitle>
					</DialogHeader>
					<div className="space-y-8 py-4">
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							<div className="lg:col-span-1">
								<form.AppField name="SearchString">
									{(f) => <f.TextField label="Search" />}
								</form.AppField>
							</div>
							<div className="lg:col-span-2">
								<form.AppField name="Roles">
									{(f) => (
										<f.RoleSelectField
											label="Roles"
											options={roleOptions}
										/>
									)}
								</form.AppField>
							</div>
							<div className="lg:col-span-1">
								<form.AppField name="IncludeDeleted">
									{(f) => <f.SwitchField label="Include deleted" />}
								</form.AppField>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<form.AppField name="CreatedAfter">
								{(f) => <f.TextField label="Created after" />}
							</form.AppField>
							<form.AppField name="CreatedBefore">
								{(f) => <f.TextField label="Created before" />}
							</form.AppField>
						</div>

						<div className="lg:col-span-1">
							<form.AppField name="PageSize">
								{(f) => (
									<f.PageSizeField
										label="Page Size"
										value={25}
									/>
								)}
							</form.AppField>
						</div>

						<div className="flex items-center justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
									(form as any).setFieldValue('PageOffset', 0);
								}}
							>
								Reset
							</Button>
							<Button
								type="button"
								onClick={() => {
									(form as any).setFieldValue('PageOffset', 0);
									form.handleSubmit();
									setFilterDialogOpen(false);
								}}
							>
								Save Changes
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export const AdminSearchUsersSearchBarFieldGroup = withFieldGroup({
	props: { roles: [] as RoleOption[] },
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group, roles }) {
		const roleOptions =
			Array.isArray(roles) && roles.length > 0 ? roles : defaultRoleOptions;

		return (
			<FieldGroup>
				<details
					className="rounded border p-3 [&>summary]:cursor-pointer"
					open
				>
					<summary className="text-sm text-muted-foreground">Filters</summary>
					<div className="mt-3 space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div className="lg:col-span-1">
								<group.AppField name="SearchString">
									{(f) => <f.TextField label="Search" />}
								</group.AppField>
							</div>
							<div className="lg:col-span-2">
								<group.AppField name="Roles">
									{(f) => (
										<f.RoleSelectField
											label="Roles"
											options={roleOptions}
										/>
									)}
								</group.AppField>
							</div>
							<div className="lg:col-span-1">
								<group.AppField name="IncludeDeleted">
									{(f) => <f.SwitchField label="Include deleted" />}
								</group.AppField>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<group.AppField name="CreatedAfter">
								{(f) => <f.TextField label="Created after" />}
							</group.AppField>
							<group.AppField name="CreatedBefore">
								{(f) => <f.TextField label="Created before" />}
							</group.AppField>
						</div>

						<div className="lg:col-span-1">
							<group.AppField name="PageSize">
								{(f) => (
									<f.PageSizeField
										label="Page Size"
										value={25}
									/>
								)}
							</group.AppField>
						</div>

						<div className="flex items-center justify-end gap-2 pt-2">
							<button
								type="button"
								className="px-3 py-2 text-sm font-medium rounded border border-input hover:bg-accent"
								onClick={() => {
									group.reset?.();
								}}
							>
								Reset Filters
							</button>
							<div>
								<group.CreateButton label="Apply Filters" />
							</div>
						</div>
					</div>
				</details>
			</FieldGroup>
		);
	},
});

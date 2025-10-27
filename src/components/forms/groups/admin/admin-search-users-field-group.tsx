// src/components/forms/admin-search-users-groups.tsx
'use client';
import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';

// 1) Define the union type and the list once (or import from a shared file)
export type Role =
	| 'owner'
	| 'admin'
	| 'backup'
	| 'ops'
	| 'service'
	| 'con_publisher'
	| 'con_writer'
	| 'com_mod'
	| 'com_appellate'
	| 'bot_verification'
	| 'evt_creator'
	| 'evt_moderator';

export const ROLES: readonly Role[] = [
	'owner',
	'admin',
	'backup',
	'ops',
	'service',
	'con_publisher',
	'con_writer',
	'com_mod',
	'com_appellate',
	'bot_verification',
	'evt_creator',
	'evt_moderator',
] as const;

// Optional labels if you want prettier text
const roleLabel: Record<Role, string> = {
	owner: 'Owner',
	admin: 'Admin',
	backup: 'Backup',
	ops: 'Ops',
	service: 'Service',
	con_publisher: 'Content Publisher',
	con_writer: 'Content Writer',
	com_mod: 'Comments Moderator',
	com_appellate: 'Comments Appellate',
	bot_verification: 'Bot Verification',
	evt_creator: 'Event Creator',
	evt_moderator: 'Event Moderator',
};

export const AdminSearchUsersSearchBarFieldGroup = withFieldGroup({
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<div className="flex flex-wrap items-end gap-2">
					<div className="flex-1 min-w-[240px]">
						<group.AppField name="SearchString">
							{(f) => <f.TextField label="Search" />}
						</group.AppField>
					</div>
					<div className="min-w-[220px]">
						<group.AppField name="Roles">
							{(f) => (
								<f.MultiSelectField
									label="Roles"
									options={[]}
									placeholder="Any role"
								/>
							)}
						</group.AppField>
					</div>
					<div className="min-w-[160px]">
						<group.AppField name="IncludeDeleted">
							{(f) => <f.SwitchField label="Include deleted" />}
						</group.AppField>
					</div>
				</div>
			</FieldGroup>
		);
	},
});

export const AdminSearchUsersFiltersFieldGroup = withFieldGroup({
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<div className="grid gap-3 md:grid-cols-2">
					<group.AppField name="CreatedAfter">
						{(f) => <f.TextField label="Created after" />}
					</group.AppField>
					<group.AppField name="CreatedBefore">
						{(f) => <f.TextField label="Created before" />}
					</group.AppField>
					<group.AppField name="UserIDs">
						{(f) => (
							<f.MultiSelectField
								label="User IDs"
								options={[]}
								placeholder="Add IDs…"
							/>
						)}
					</group.AppField>
				</div>
			</FieldGroup>
		);
	},
});

export const AdminSearchUsersPagingFieldGroup = withFieldGroup({
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<div className="flex items-center gap-3">
					<group.AppField name="PageSize">
						{(f) => (
							<f.NumberField
								label="Page size"
								min={1}
								step={1}
							/>
						)}
					</group.AppField>
					{/* hidden server paging cursor */}
					<group.AppField name="PageOffset">
						{(f) => <f.HiddenField />}
					</group.AppField>
				</div>
			</FieldGroup>
		);
	},
});

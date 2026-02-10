// src/components/forms/admin-search-users-groups.tsx
'use client';
import { FieldGroup } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
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

export const AdminSearchUsersSearchBarFieldGroup = withFieldGroup({
	props: { roles: [] as RoleOption[] },
	defaultValues: create(SearchUsersAdminRequestSchema),
	render: function Render({ group, roles }) {
		const form = useFormContext();
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
							<Button
								type='button'
								variant='outline'
								onClick={() => {
									form.reset();
									(form as any).setFieldValue('PageOffset', 0);
									form.handleSubmit();
								}}
							>
								Reset Filters
							</Button>
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

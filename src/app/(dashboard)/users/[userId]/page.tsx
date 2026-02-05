'use server';

import {
	adminDisableOtherTotp,
	adminGetUser,
	adminGetUserTotpDevices,
} from '@/app/actions/auth';
import type { UserNormalRecord } from '@inverted-tech/fragments/protos/Authentication/UserRecord_pb';
import { UserTimeline } from '@/components/users/view-user/user-timeline';
import { UserDetails } from '@/components/users/view-user/user-details';
import { UserHeaderCard } from '@/components/users/view-user/user-header';
import { UserSubscriptions } from '@/components/users/view-user/user-subscriptions';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { grantRolesToUser, enableUser, disableUser } from '@/app/actions/auth';
import { create } from '@bufbuild/protobuf';
import {
	ModifyOtherUserRolesRequestSchema,
	DisableEnableOtherUserRequestSchema,
	DisableOtherTotpRequestSchema,
} from '@inverted-tech/fragments/Authentication';
import {
	getSubscriptionsForUser,
	cancelSubscribition,
} from '@/app/actions/payment';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher } from '@/lib/roleHelpers';
import { getSession } from '@/lib/session';

function pick<T = unknown>(obj: any, paths: string[], fb?: T): T | undefined {
	for (const p of paths) {
		const v = p.split('.').reduce<any>((o, k) => (o ? o[k] : undefined), obj);
		if (v !== undefined && v !== null && v !== '') return v as T;
	}
	return fb;
}

export default async function ViewUserPage({
	params,
}: {
	params: { userId: string };
}) {
	await requireRole(isAdminOrHigher);
	const session = await getSession();
	const roles = session.roles ?? [];
	const { userId } = await params;
	const subs = await getSubscriptionsForUser(userId);
	const res = await adminGetUser(userId);
	const user: UserNormalRecord | undefined = res?.Record;
	if (!user) notFound();

	// inferred fields across Public/Private shapes
	const id = pick<string>(user, ['UserID', 'Public.UserID'], userId) ?? userId;
	const displayName = pick<string>(
		user,
		['Public.Data.DisplayName', 'DisplayName'],
		'—',
	)!;
	const userName =
		pick<string>(user, ['Public.Data.UserName', 'UserName'], '') || '—';
	const email = pick<string>(user, ['Private.Data.Email', 'Email'], '') || '—';
	const bio = pick<string>(user, ['Public.Data.Bio', 'Bio'], '') || '—';
	const createdOn = pick(user, ['Public.CreatedOnUTC', 'CreatedOnUTC']);
	const modifiedOn = pick(user, ['Public.ModifiedOnUTC', 'ModifiedOnUTC']);
	const disabledOn = pick(user, ['Private.DisabledOnUTC', 'DisabledOnUTC']);
	const profilePng = pick<string>(
		user,
		['Public.Data.ProfileImagePNG', 'ProfileImagePNG'],
		'',
	);
	const totpDevices = (await adminGetUserTotpDevices(userId)).Devices ?? [];
	async function grantRolesAction(formData: FormData) {
		'use server';
		const selected = formData.getAll('roles')?.map((v) => String(v)) ?? [];
		await grantRolesToUser(
			create(ModifyOtherUserRolesRequestSchema, {
				UserID: id,
				Roles: selected,
			}),
		);
		revalidatePath(`/users/${id}`);
	}

	async function enableUserAction() {
		'use server';
		await enableUser(
			create(DisableEnableOtherUserRequestSchema, {
				UserID: id,
			}),
		);
		revalidatePath(`/users/${id}`);
	}

	async function disableUserAction() {
		'use server';
		await disableUser(
			create(DisableEnableOtherUserRequestSchema, {
				UserID: id,
			}),
		);
		revalidatePath(`/users/${id}`);
	}

	async function disableTotpAction(formData: FormData) {
		'use server';
		// TODO: Fix this
		const totpId = String(formData.get('totpId') ?? '').trim();
		if (!totpId) return;
		await adminDisableOtherTotp(
			create(DisableOtherTotpRequestSchema, {
				UserID: id,
				TotpID: totpId,
			}),
		);
		revalidatePath(`/users/${id}`);
	}

	async function cancelSubscriptionAction(formData: FormData) {
		'use server';
		await cancelSubscribition(formData);
		revalidatePath(`/users/${id}`);
	}

	return (
		<div>
			<div className="mb-6">
				<UserHeaderCard
					id={id}
					displayName={displayName}
					userName={userName}
					email={email}
					roles={roles}
					profilePng={profilePng}
					disabled={Boolean(disabledOn)}
					grantRolesAction={grantRolesAction}
					enableUserAction={enableUserAction}
					disableUserAction={disableUserAction}
				/>
			</div>
			<div className="mb-4">
				<UserTimeline
					createdOn={createdOn}
					modifiedOn={modifiedOn}
					disabledOn={disabledOn}
				/>
			</div>
			<div className="mb-4">
				<UserDetails
					id={id}
					email={email}
					bio={bio}
					userName={userName}
					displayName={displayName}
					totpDevices={totpDevices}
					disableTotpAction={disableTotpAction}
					roles={roles}
				/>
			</div>
			<div className="mb-4">
				<UserSubscriptions
					subscriptions={subs}
					cancelSubscriptionAction={cancelSubscriptionAction}
				/>
			</div>
		</div>
	);
}

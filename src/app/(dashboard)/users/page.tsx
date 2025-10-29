"use server";

import { listUsers } from '@/app/actions/auth';
import { UsersTable } from '@/components/tables/users-table';
import { create } from '@bufbuild/protobuf';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';

export default async function AllUsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
    const sp = (typeof (searchParams as any)?.then === 'function')
        ? await (searchParams as Promise<{ [key: string]: string | string[] | undefined }>)
        : ((searchParams as { [key: string]: string | string[] | undefined }) || undefined);

    const includeDeletedParam = Array.isArray(sp?.includeDeleted)
        ? sp?.includeDeleted[0]
        : sp?.includeDeleted;
    const includeDeleted = includeDeletedParam === '1' || includeDeletedParam === 'true';
    const rolesParam = sp?.Roles;
    const roles = Array.isArray(rolesParam)
        ? rolesParam
        : rolesParam
        ? [rolesParam]
        : [];
    const userIdsParam = sp?.UserIDs;
    const userIds = Array.isArray(userIdsParam)
        ? userIdsParam
        : userIdsParam
        ? [userIdsParam]
        : [];
    const searchStringParam = Array.isArray(sp?.SearchString)
        ? sp?.SearchString[0]
        : sp?.SearchString;

    const users = await listUsers(
        create(SearchUsersAdminRequestSchema, {
            IncludeDeleted: includeDeleted,
            Roles: roles,
            UserIDs: userIds,
            SearchString: searchStringParam ?? undefined,
        })
    );

    return (
        <>
            <UsersTable data={users.Records} />
        </>
    );
}

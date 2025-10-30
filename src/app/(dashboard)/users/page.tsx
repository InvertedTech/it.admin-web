"use server";

import { listUsers } from '@/app/actions/auth';
import { UsersTable } from '@/components/tables/users-table';
import { create } from '@bufbuild/protobuf';
import { SearchUsersAdminRequestSchema } from '@inverted-tech/fragments/Authentication';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { RoleMeta, Roles } from '@/lib/types';

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
            PageSize: 100,
            PageOffset: 0,
        })
    );

    const recs = users?.Records ?? [];
    const toDate = (v: any) => {
      if (!v) return undefined as Date | undefined;
      if (v instanceof Date) return v;
      if (typeof v === 'string') {
        const d = new Date(v); return Number.isNaN(d.getTime()) ? undefined : d;
      }
      if (typeof v === 'object' && 'seconds' in (v as any)) {
        const s = Number((v as any).seconds ?? 0);
        const n = Number((v as any).nanos ?? 0);
        const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
        return Number.isNaN(d.getTime()) ? undefined : d;
      }
      return undefined;
    };
    const fmt = (d?: Date) => (d ? d.toLocaleString() : '—');

    const disabled = (r: any) => Boolean(toDate((r as any)?.DisabledOnUTC ?? (r as any)?.Private?.DisabledOnUTC));
    const activeCount = recs.filter((r) => !disabled(r)).length;
    const disabledCount = recs.length - activeCount;
    const roleCounts = Roles.reduce<Record<string, number>>((acc, r) => {
      acc[r] = recs.filter((u: any) => Array.isArray(u?.Roles) && u.Roles.includes(r)).length;
      return acc;
    }, {} as any);
    const recent = [...recs]
      .map((r: any) => ({ r, d: toDate(r?.CreatedOnUTC ?? r?.Public?.CreatedOnUTC) }))
      .filter((x) => x.d)
      .sort((a, b) => (b.d as Date).getTime() - (a.d as Date).getTime())
      .slice(0, 8);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                <p className="text-muted-foreground">Live overview of your user base.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total (page)" value={recs.length} />
                <StatCard title="Active" value={activeCount} accent="success" />
                <StatCard title="Disabled" value={disabledCount} accent="warning" />
                <StatCard title="Admins" value={roleCounts['admin'] ?? 0} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="gap-1">
                        <CardTitle>Recent signups</CardTitle>
                        <CardDescription>Last 8 created users (current query).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recent.length ? (
                            <ul className="divide-y">
                                {recent.map(({ r, d }) => {
                                    const id = (r as any)?.UserID ?? (r as any)?.Public?.UserID ?? '';
                                    const name = (r as any)?.DisplayName ?? (r as any)?.Public?.Data?.DisplayName ?? '—';
                                    const userName = (r as any)?.UserName ?? (r as any)?.Public?.Data?.UserName ?? '';
                                    return (
                                        <li key={id} className="flex items-center justify-between py-2">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    <Link href={`/users/${id}`} className="underline underline-offset-2">{name}</Link>
                                                </div>
                                                <div className="text-muted-foreground truncate text-xs">@{userName || '—'}</div>
                                            </div>
                                            <div className="whitespace-nowrap text-sm">{fmt(d)}</div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-muted-foreground text-sm">No recent users found.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Roles breakdown</CardTitle>
                        <CardDescription>Counts for current result set.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                            {Roles.map((r) => (
                                <div key={r} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{RoleMeta[r].label}</Badge>
                                        <span className="text-xs text-muted-foreground">{RoleMeta[r].category}</span>
                                    </div>
                                    <div className="tabular-nums">{roleCounts[r] ?? 0}</div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="text-xs text-muted-foreground">Stats reflect filters in the table below.</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Search, filter, and manage users.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <UsersTable data={recs} />
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({
  title,
  value,
  accent,
}: { title: string; value: number | string; accent?: 'success' | 'warning' }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>{accent === 'success' ? <Badge variant='secondary'>Healthy</Badge> : accent === 'warning' ? <Badge variant='outline'>Attention</Badge> : <div className='h-6' />}</CardContent>
    </Card>
  );
}

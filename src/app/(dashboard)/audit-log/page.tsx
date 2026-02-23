'use server';
import { searchAuditLogEntries } from '@/app/actions/auditLog';
import { AuditLogSearchView } from '@/components/admin/audit-log-search-view';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher } from '@/lib/roleHelpers';
import { create } from '@bufbuild/protobuf';
import { SearchEntriesRequestSchema } from '@inverted-tech/fragments/AuditLog';

type Props = {
	searchParams: Promise<{
		PageSize: string;
		PageOffset: string;
	}>;
};

function toInt(v: string | undefined, fallback: number) {
	if (!v) return fallback;
	const n = Number.parseInt(v, 10);
	return Number.isFinite(n) ? n : fallback;
}

export default async function AuditLogPage(props: Props) {
	await requireRole(isAdminOrHigher);
	const sp = (await props.searchParams) ?? {};
	const pageSize = toInt(sp.PageSize, 25);
	const pageOffset = toInt(sp.PageOffset, 0);

	const logs = await searchAuditLogEntries(
		create(SearchEntriesRequestSchema, {
			PageSize: pageSize,
			PageOffset: pageOffset,
		}),
	);
	return (
		<>
			<AuditLogSearchView
				data={logs.Entries}
				pageSize={pageSize}
				pageOffset={pageOffset}
				pageTotalItems={logs.PageTotalItems}
			/>
		</>
	);
}

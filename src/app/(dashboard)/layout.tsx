import type { CSSProperties, ReactNode } from 'react';

import { AppSidebar, SiteHeader } from '@/components/layout/nav';
import { getSession } from '@/lib/session';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';

type DashboardLayoutProps = {
	children: ReactNode;
};

/**
 * Shared chrome for dashboard pages: sidebar navigation and top header.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
	const s = await getSession();
	const userName = s.userName ?? undefined;
	// TODO(auth-removal): Remove role/authorization read.
	const roles = s.roles ?? [];
	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as CSSProperties
			}
		>
			<AppSidebar
				variant="inset"
				sessionUserName={userName}
				sessionRoles={roles}
			/>
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="dashboard-shell @container/main">{children}</div>
				</div>
				<Toaster />
			</SidebarInset>
		</SidebarProvider>
	);
}

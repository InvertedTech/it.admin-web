import type { CSSProperties, ReactNode } from "react"

import { AppSidebar, SiteHeader } from "@/components/layout/nav"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

type DashboardLayoutProps = {
  children: ReactNode
}

/**
 * Shared chrome for dashboard pages: sidebar navigation and top header.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

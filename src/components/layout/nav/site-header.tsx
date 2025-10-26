'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '../buttons/mode-toggle';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function SiteHeader() {
	const pathname = usePathname();
	const segments = pathname
		.split('/')
		.filter(Boolean)
		.map((seg, i, arr) => ({
			name: seg.charAt(0).toUpperCase() + seg.slice(1),
			href: '/' + arr.slice(0, i + 1).join('/'),
			isLast: i === arr.length - 1,
		}));

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>

				<Breadcrumb>
					<BreadcrumbList>
						{segments.map((seg, i) => (
							<React.Fragment key={seg.href}>
								<BreadcrumbItem>
									{seg.isLast ? (
										<BreadcrumbPage>{seg.name}</BreadcrumbPage>
									) : (
										<BreadcrumbLink href={seg.href}>{seg.name}</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{i < segments.length - 1 && <BreadcrumbSeparator />}
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>

				<div className="ml-auto flex items-center gap-2">
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}

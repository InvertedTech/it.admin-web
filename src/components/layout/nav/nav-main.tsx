// components/layout/nav/nav-main.tsx
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NavNode = {
	title: string;
	url: string;
	icon?: React.ComponentType<{ className?: string }>;
	isActive?: boolean;
	items?: NavNode[];
};

export function NavMain({ items }: { items: NavNode[] }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavRow
						key={item.title}
						item={item}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

function NavRow({ item }: { item: NavNode }) {
	const pathname = usePathname();
	const Icon = item.icon;
	const hasChildren = !!item.items?.length;

	const norm = (p: string) =>
		p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
	const here = norm(pathname);
	const me = norm(item.url);

	const anyChildMatch = !!item.items?.some((s) => {
		const c = norm(s.url);
		return here === c || here.startsWith(c + '/');
	});

	const segmentOpen = here === me || here.startsWith(me + '/') || anyChildMatch;
	const parentActive = here === me || !!item.isActive;

	const [open, setOpen] = React.useState<boolean>(segmentOpen);
	React.useEffect(() => setOpen(segmentOpen), [segmentOpen]);

	if (!hasChildren) {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					isActive={parentActive}
				>
					<a href={item.url}>
						{Icon && <Icon className="size-4" />}
						<span>{item.title}</span>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	return (
		<Collapsible
			asChild
			open={open}
			onOpenChange={setOpen}
		>
			<SidebarMenuItem>
				<div className="flex w-full items-center">
					<SidebarMenuButton
						asChild
						isActive={parentActive}
						className="flex-1"
					>
						<a
							href={item.url}
							className="flex items-center gap-2"
						>
							{Icon && <Icon className="size-4" />}
							<span>{item.title}</span>
						</a>
					</SidebarMenuButton>

					<Button
						type="button"
						size="icon"
						variant="ghost"
						onClick={() => setOpen((v) => !v)}
						className={cn(
							'ml-auto h-7 w-7 p-0 text-muted-foreground hover:text-foreground',
							open && 'text-foreground'
						)}
						aria-label={open ? 'Collapse section' : 'Expand section'}
					>
						<ChevronRight
							className={cn('size-4 transition-transform', open && 'rotate-90')}
						/>
					</Button>
				</div>

				<CollapsibleContent>
					<SidebarMenuSub>
						{item.items!.map((sub) => {
							const subMe = norm(sub.url);
							const active = here === subMe || here.startsWith(subMe + '/');
							return (
								<SidebarMenuSubItem key={sub.title}>
									<SidebarMenuSubButton
										asChild
										isActive={active}
									>
										<a
											href={sub.url}
											className="flex items-center gap-2"
										>
											{sub.icon && <sub.icon className="size-3.5" />}
											<span>{sub.title}</span>
										</a>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							);
						})}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

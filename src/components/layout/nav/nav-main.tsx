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
					<TopRow
						key={item.title}
						item={item}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

function TopRow({ item }: { item: NavNode }) {
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
						{item.items!.map((sub) => (
							<SubRow
								key={sub.title}
								node={sub}
								here={here}
							/>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

function SubRow({ node, here }: { node: NavNode; here: string }) {
	const Icon = node.icon;
	const norm = (p: string) =>
		p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
	const me = norm(node.url);
	const hasChildren = !!node.items?.length;

	const anyChildMatch = !!node.items?.some((s) => {
		const c = norm(s.url);
		return here === c || here.startsWith(c + '/');
	});

	const openByPath = here === me || here.startsWith(me + '/') || anyChildMatch;
	const active = here === me || !!node.isActive;

	const [open, setOpen] = React.useState<boolean>(openByPath);
	React.useEffect(() => setOpen(openByPath), [openByPath]);

	// leaf
	if (!hasChildren) {
		return (
			<SidebarMenuSubItem>
				<SidebarMenuSubButton
					asChild
					isActive={active}
				>
					<a
						href={node.url}
						className="flex items-center gap-2"
					>
						{Icon && <Icon className="size-3.5" />}
						<span>{node.title}</span>
					</a>
				</SidebarMenuSubButton>
			</SidebarMenuSubItem>
		);
	}

	// nested group
	return (
		<SidebarMenuSubItem>
			<div className="flex w-full items-center">
				<SidebarMenuSubButton
					asChild
					isActive={active}
					className="flex-1"
				>
					<a
						href={node.url}
						className="flex items-center gap-2"
					>
						{Icon && <Icon className="size-3.5" />}
						<span>{node.title}</span>
					</a>
				</SidebarMenuSubButton>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					onClick={() => setOpen((v) => !v)}
					className={cn(
						'ml-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground',
						open && 'text-foreground'
					)}
					aria-label={open ? 'Collapse subsection' : 'Expand subsection'}
				>
					<ChevronRight
						className={cn('size-3.5 transition-transform', open && 'rotate-90')}
					/>
				</Button>
			</div>

			{open && (
				<SidebarMenuSub className="pl-4">
					{node.items!.map((child) => (
						<SubRow
							key={child.title}
							node={child}
							here={here}
						/>
					))}
				</SidebarMenuSub>
			)}
		</SidebarMenuSubItem>
	);
}

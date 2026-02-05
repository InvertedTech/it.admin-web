'use client';

import * as React from 'react';
import {
	IconHelp,
	IconInnerShadowTop,
	IconMoneybag,
	IconSearch,
} from '@tabler/icons-react';

import { NavQuick } from '@/components/layout/nav/nav-quick';
import { NavSecondary } from '@/components/layout/nav/nav-secondary';
import { NavUser } from '@/components/layout/nav/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
	Bell,
	CreditCard,
	FileText,
	FilesIcon,
	Images,
	MessageSquare,
	Palette,
	PlusSquare,
	Settings as SettingsIcon,
	Upload,
	UserIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NavMain } from './nav-main';
import {
	canModerateEvent,
	isAdminOrHigher,
	isCommentModeratorOrHigher,
	isOwner,
	isWriterOrHigher,
} from '@/lib/roleHelpers';

// TODO: Look Into Generate Via API Route and return the navs users can use
const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	navMain: [
		{
			title: 'Content',
			icon: FileText,
			url: '/content',
		},
		{
			title: 'Assets',
			icon: Images,
			url: '/content/assets',
		},
		{
			title: 'Upload Asset',
			icon: Upload,
			url: '/content/assets/upload',
		},
		{
			title: 'Create',
			icon: PlusSquare,
			url: '/content/create',
		},
		// {
		// 	title: 'Events',
		// 	icon: CalendarDays,
		// 	url: '/events',
		// 	items: [
		// 		{ title: 'Create', icon: CalendarDays, url: '/events/create' },
		// 		{
		// 			title: 'Create Recurring',
		// 			icon: CalendarDays,
		// 			url: '/events/create/recurring',
		// 		},
		// 		{
		// 			title: 'Events (future)',
		// 			icon: CalendarDays,
		// 			url: '/settings/events',
		// 		},
		// 	],
		// },
		{
			title: 'Members',
			icon: UserIcon,
			url: '/users',
		},
		{
			title: 'Settings',
			icon: SettingsIcon,
			url: '/settings',
			items: [
				{
					title: 'Personalization Settings',
					icon: Palette,
					url: '/settings/personalization',
				},
				{
					title: 'Notifications Settings',
					icon: Bell,
					url: '/settings/notifications',
				},
				{
					title: 'Subscriptions Settings',
					icon: CreditCard,
					url: '/settings/subscriptions',
				},
				{
					title: 'Comments Settings',
					icon: MessageSquare,
					url: '/settings/comments',
				},
				{
					title: 'Content Settings',
					icon: FilesIcon,
					url: '/settings/content',
				},
			],
		},
	],
	navQuick: [
		// { title: 'Upload Asset', url: '/asset/upload', icon: IconUpload }
	],
	navSecondary: [
		{
			title: 'Get Help',
			url: '#',
			icon: IconHelp,
		},
		{
			title: 'Search',
			url: '#',
			icon: IconSearch,
		},
	],
};

type NavItem = {
	title: string;
	icon: React.ComponentType<any>;
	url: string;
	items?: NavItem[];
};

function canAccessRoute(url: string, roles: string[]) {
	if (url.startsWith('/content')) return isWriterOrHigher(roles);
	if (url.startsWith('/comments')) return isCommentModeratorOrHigher(roles);
	if (url.startsWith('/events')) return canModerateEvent(roles);
	if (url.startsWith('/users')) return isAdminOrHigher(roles);
	if (url.startsWith('/settings/notifications')) return isOwner(roles);
	if (url.startsWith('/settings')) return isAdminOrHigher(roles);
	return roles.length > 0;
}

function filterNavItems(items: NavItem[], roles: string[]): NavItem[] {
	return items
		.map((item) => {
			const childItems = item.items
				? filterNavItems(item.items, roles)
				: undefined;
			const allowed = canAccessRoute(item.url, roles);
			if (!allowed && (!childItems || childItems.length === 0)) {
				return null;
			}
			return { ...item, items: childItems };
		})
		.filter(Boolean) as NavItem[];
}

// TODO: Add Favorited Pages Section Stored In A Cookie
export function AppSidebar({
	headerTitle = 'Inverted CMS',
	sessionUserName,
	sessionEmail,
	sessionRoles,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	headerTitle?: string;
	sessionUserName?: string;
	sessionEmail?: string;
	sessionRoles?: string[];
}) {
	const roles = sessionRoles ?? [];
	const navMain = filterNavItems(data.navMain as NavItem[], roles);
	return (
		<Sidebar
			collapsible="offcanvas"
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">{headerTitle}</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{/* <NavQuick items={data.navQuick} /> */}
				<Separator />
				<NavMain items={navMain} />
				{/* <NavSecondary items={data.navSecondary} className='mt-auto' /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: sessionUserName || data.user.name,
						email: sessionEmail || data.user.email,
						avatar: data.user.avatar,
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}

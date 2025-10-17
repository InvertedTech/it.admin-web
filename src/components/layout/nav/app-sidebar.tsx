'use client';

import * as React from 'react';
import {
	IconCalendarPlus,
	IconChartBar,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconFolders,
	IconHelp,
	IconInnerShadowTop,
	IconListDetails,
	IconReport,
	IconSearch,
	IconSettings,
	IconTags,
	IconUpload,
	IconUsers,
} from '@tabler/icons-react';

import { NavQuick } from '@/components/layout/nav/nav-quick';
import { NavSecondary } from '@/components/layout/nav/nav-secondary';
import { NavUser } from '@/components/layout/nav/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
	CalendarDays,
	ChevronRight,
	CreditCard,
	FilesIcon,
	GalleryVerticalEnd,
	MessageSquare,
	UserIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NavMain } from './nav-main';

const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	navMain: [
		{
			title: 'Assets',
			icon: FilesIcon,
			url: '/asset',
			items: [
				{ title: 'List', url: '/asset' },
				{ title: 'Upload', url: '/asset/upload' },
			],
		},
		{
			title: 'Content',
			icon: GalleryVerticalEnd,
			url: '/content',
			items: [
				{ title: 'List', url: '/content' },
				{ title: 'Create', url: '/content/create' },
				// scoped settings
				{ title: 'Settings', url: '/content/settings' },
			],
		},
		{
			title: 'Comments',
			icon: MessageSquare,
			url: '/comments',
			items: [
				{ title: 'List', url: '/comments' },
				// add when you have config flags
				{ title: 'Settings', url: '/comments/settings' },
			],
		},
		{
			title: 'Events',
			icon: CalendarDays,
			url: '/events',
			items: [
				{ title: 'List', url: '/events' },
				{ title: 'Create', url: '/events/create' },
				{ title: 'Create Recurring', url: '/events/create/recurring' },
				// placeholder settings (fill when you add defaults)
				{ title: 'Settings', url: '/events/settings' },
			],
		},
		{
			title: 'Users',
			icon: UserIcon,
			url: '/users',
			items: [
				{ title: 'List', url: '/users/list' },
				{ title: 'Staff (Admins)', url: '/users/list?role=admin' }, // Team merged here
				// subscriptions settings scoped under users
				{
					title: 'Subscriptions',
					url: '/users/settings/subscriptions',
				},
			],
		},
	],
	navQuick: [
		{
			title: 'New Content',
			url: '/content/create',
			icon: IconFileDescription,
		},
		{ title: 'Upload Asset', url: '/asset/upload', icon: IconUpload },
		{ title: 'New Event', url: '/events/create', icon: IconCalendarPlus },
		{
			title: 'Create Category',
			url: '/content/settings/categories?new=1',
			icon: IconTags,
		},
		{
			title: 'Create Channel',
			url: '/content/settings/channels?new=1',
			icon: IconFolders,
		},
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

export function AppSidebar({
	headerTitle = 'Inverted CMS',
	...props
}: React.ComponentProps<typeof Sidebar> & {
	headerTitle?: string;
}) {
	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='data-[slot=sidebar-menu-button]:!p-1.5'
						>
							<a href='/'>
								<IconInnerShadowTop className='!size-5' />
								<span className='text-base font-semibold'>
									{headerTitle}
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavQuick items={data.navQuick} />
				<Separator />
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

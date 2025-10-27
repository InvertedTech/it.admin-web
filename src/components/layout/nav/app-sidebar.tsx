'use client';

import * as React from 'react';
import {
	IconFolders,
	IconHelp,
	IconInnerShadowTop,
	IconMoneybag,
	IconSearch,
	IconTags,
	IconUpload,
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
	CalendarDays,
	CreditCard,
	FilesIcon,
	FolderCog,
	GalleryVerticalEnd,
	MessageSquare,
	Palette,
	Settings as SettingsIcon,
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
			title: 'Content',
			icon: GalleryVerticalEnd,
			url: '/content',
			items: [
				{ title: 'Assets', icon: GalleryVerticalEnd, url: '/content/assets' },
				{
					title: 'Upload Asset',
					icon: GalleryVerticalEnd,
					url: '/content/assets/upload',
				},
				{
					title: 'All Content',
					icon: FilesIcon,
					url: '/content/all',
				},
				{ title: 'Create', icon: GalleryVerticalEnd, url: '/content/create' },
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
		{
			title: 'Events',
			icon: CalendarDays,
			url: '/events',
			items: [
				{ title: 'Create', icon: CalendarDays, url: '/events/create' },
				{
					title: 'Create Recurring',
					icon: CalendarDays,
					url: '/events/create/recurring',
				},
				{
					title: 'Events (future)',
					icon: CalendarDays,
					url: '/settings/events',
				},
			],
		},
		{
			title: 'Members',
			icon: UserIcon,
			url: '/users',
			items: [
				{
					title: 'Staff (Admins)',
					icon: UserIcon,
					url: '/users/list?role=admin',
				},
				{
					title: 'Search',
					icon: UserIcon,
					url: '/users/search',
				},
				{
					title: 'Subscriptions',
					icon: IconMoneybag,
					url: '/users/subscriptions',
				},
				{
					title: 'Subscriptions Settings',
					icon: CreditCard,
					url: '/settings/subscriptions',
				},
			],
		},
		{
			title: 'Settings',
			icon: SettingsIcon,
			url: '/settings',
			items: [
				// {
				// 	title: 'Subscriptions',
				// 	icon: CreditCard,
				// 	url: '/settings/subscriptions',
				// },
				// {
				// 	title: 'Comments Settings',
				// 	icon: MessageSquare,
				// 	url: '/settings/comments',
				// },
				// {
				// 	title: 'Content Settings',
				// 	icon: FilesIcon,
				// 	url: '/settings/content',
				// },
				// {
				// 	title: 'Events (future)',
				// 	icon: CalendarDays,
				// 	url: '/settings/events',
				// },
				{
					title: 'Personalization',
					icon: Palette,
					url: '/settings/personalization',
				},
				{
					title: 'Notifications',
					icon: Bell,
					url: '/settings/notifications',
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

export function AppSidebar({
	headerTitle = 'Inverted CMS',
	...props
}: React.ComponentProps<typeof Sidebar> & {
	headerTitle?: string;
}) {
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
				<NavQuick items={data.navQuick} />
				<Separator />
				<NavMain items={data.navMain} />
				<NavSecondary
					items={data.navSecondary}
					className="mt-auto"
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

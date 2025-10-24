'use client';

import {
	IconCirclePlusFilled,
	IconChevronRight,
	type Icon,
} from '@tabler/icons-react';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import { NewAssetForm } from '@/components/forms/new-asset-form';
import { NewCategoryForm } from '@/components/forms/new-category-form';
import { NewChannelForm } from '@/components/forms/new-channel-form';
import * as React from 'react';

// TODO: Add Quick Actions For CMS Here
export function NavQuick({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
	}[];
}) {
	const [open, setOpen] = React.useState<
		null | 'asset' | 'category' | 'channel'
	>(null);

	const clickFromTitle = (
		title: string
	): null | 'asset' | 'category' | 'channel' => {
		switch (title) {
			case 'Upload Asset':
				return 'asset';
			case 'Create Category':
				return 'category';
			case 'Create Channel':
				return 'channel';
			default:
				return null;
		}
	};

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent className="flex flex-col gap-2">
					{/* Header action with dropdown menu */}
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										tooltip="Quick Create"
										variant="outline"
										className="cursor-pointer"
									>
										<IconCirclePlusFilled />
										<span>Quick Create</span>
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									side="right"
									className="w-56"
								>
									<DropdownMenuLabel>Quick Create</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{items.map((item) => {
										const key = clickFromTitle(item.title);
										if (!key) return null;
										return (
											<DropdownMenuItem
												key={`qm-${item.title}`}
												onSelect={(e) => {
													e.preventDefault();
													setOpen(key);
												}}
												className="cursor-pointer"
											>
												{item.icon && <item.icon className="mr-2" />}
												<span>{item.title}</span>
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>

					{/* Quick links */}
					<SidebarMenu>
						{items.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									className="transition-all duration-200 ease-linear hover:translate-x-0.5 hover:shadow-sm"
								>
									<a href={item.url}>
										{item.icon && <item.icon />}
										<span className="flex-1">{item.title}</span>
										<IconChevronRight className="ml-auto opacity-60 group-hover/menu-item:opacity-100" />
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			{/* Modals */}
			<Dialog
				open={open === 'asset'}
				onOpenChange={(o) => !o && setOpen(null)}
			>
				<DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
					<DialogTitle>Upload Asset</DialogTitle>
					<DialogDescription>Upload an image or audio file.</DialogDescription>
					<NewAssetForm />
				</DialogContent>
			</Dialog>
			<Dialog
				open={open === 'category'}
				onOpenChange={(o) => !o && setOpen(null)}
			>
				<DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
					<DialogTitle>Create Category</DialogTitle>
					<DialogDescription>Define and add a new category.</DialogDescription>
					<NewCategoryForm />
				</DialogContent>
			</Dialog>
			<Dialog
				open={open === 'channel'}
				onOpenChange={(o) => !o && setOpen(null)}
			>
				<DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogTitle>Create Channel</DialogTitle>
					<DialogDescription>Define and add a new channel.</DialogDescription>
					<NewChannelForm />
				</DialogContent>
			</Dialog>
		</>
	);
}

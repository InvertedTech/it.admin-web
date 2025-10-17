import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon; // component type, e.g. FilesIcon
	isActive?: boolean;
	items?: Array<{
		title: string;
		url: string;
		isActive?: boolean;
	}>;
};

export function NavMain({ items }: { items: NavItem[] }) {
	return (
		<>
			{items.map((section) => {
				const hasChildren = !!section.items?.length;

				return (
					<Collapsible
						key={section.title}
						defaultOpen={hasChildren && !!section.isActive}
						className='group/collapsible'
					>
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								{hasChildren ? (
									<CollapsibleTrigger className='flex items-center gap-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
										{section.icon ? (
											<section.icon className='size-4' />
										) : null}
										<span>{section.title}</span>
										<ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
									</CollapsibleTrigger>
								) : (
									<SidebarMenuButton
										asChild
										isActive={section.isActive}
										className='text-sm'
									>
										<a
											href={section.url}
											className='flex items-center gap-2'
										>
											{section.icon ? (
												<section.icon className='size-4' />
											) : null}
											<span>{section.title}</span>
										</a>
									</SidebarMenuButton>
								)}
							</SidebarGroupLabel>

							{hasChildren && (
								<CollapsibleContent>
									<SidebarGroupContent>
										<SidebarMenu>
											{section.items!.map((child) => (
												<SidebarMenuItem
													key={`${section.title}-${child.title}`}
												>
													<SidebarMenuButton
														asChild
														isActive={
															child.isActive
														}
													>
														<a href={child.url}>
															{child.title}
														</a>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</CollapsibleContent>
							)}
						</SidebarGroup>
					</Collapsible>
				);
			})}
		</>
	);
}

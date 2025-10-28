'use client';

import { CalendarSection } from '@/components/forms/groups/content/content-dashboard-calendar';
import { OverviewSection } from '@/components/forms/groups/content/content-dashboard-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentPage() {
	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-semibold tracking-tight'>Content</h1>
			<p className='text-sm text-muted-foreground'>
				Overview, calendar, and quick actions.
			</p>

			<Tabs defaultValue='overview' className='w-full'>
				<TabsList className='justify-start overflow-x-auto'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='calendar'>Calendar</TabsTrigger>
				</TabsList>

				<TabsContent value='overview' className='mt-6'>
					<OverviewSection />
				</TabsContent>

				<TabsContent value='calendar' className='mt-6'>
					<CalendarSection />
				</TabsContent>
			</Tabs>
		</div>
	);
}

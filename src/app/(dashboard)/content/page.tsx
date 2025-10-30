import { CalendarSection } from '@/components/forms/groups/content/content-dashboard-calendar';
import { OverviewSection } from '@/components/forms/groups/content/content-dashboard-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCalendarEvents, getWeekEvents, getOverviewActivity } from '@/app/actions/content';

export default async function ContentPage() {
    const today = new Date();
    const ym = today.toISOString().slice(0, 7); // YYYY-MM

    const [week, month, activity] = await Promise.all([
        getWeekEvents({ startDate: today.toISOString().slice(0, 10) }),
        getCalendarEvents({ ym }),
        getOverviewActivity({ rangeDays: 90, limitDrafts: 5, limitScheduled: 5, limitRecent: 5 }),
    ]);

    return (
        <div>
            <div className='space-y-1 mb-6'>
                <h1 className='text-2xl font-semibold tracking-tight'>Content</h1>
                <p className='text-sm text-muted-foreground'>
                    Overview, calendar, and quick actions.
                </p>
            </div>

            <Tabs defaultValue='overview' className='w-full'>
                <TabsList className='justify-start overflow-x-auto'>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='calendar'>Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='mt-6'>
                    <OverviewSection
                        weekEventsData={week}
                        stats={activity.stats}
                        drafts={activity.drafts}
                        scheduled={activity.scheduled}
                        recent={activity.recent}
                    />
                </TabsContent>

                <TabsContent value='calendar' className='mt-6'>
                    <CalendarSection initialMonth={ym} events={month} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

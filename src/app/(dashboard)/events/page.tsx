import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarSection } from '@/components/forms/groups/content/content-dashboard-calendar';
import { EventsOverviewSection, demoEventCal, demoUpcoming } from '@/components/forms/groups/events/events-dashboard-overview';

export default async function EventsDashboardPage() {
    const ym = new Date().toISOString().slice(0, 7);
    // Mock data for now; when API routes exist, pass live data here
    const calendarEvents = demoEventCal;
    const upcoming = demoUpcoming;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground">Overview, calendar, tickets and quick actions.</p>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="justify-start overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <EventsOverviewSection upcoming={upcoming} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                    <CalendarSection initialMonth={ym} events={calendarEvents} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

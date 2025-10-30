"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CalendarDays, Ticket, Users } from 'lucide-react';
import type { ContentEvent, Item } from '@/lib/utils';

export type EventListItem = Item & { venue?: string; tickets?: number };

export const demoUpcoming: EventListItem[] = [
  { id: 'e1', title: 'Friday Live', status: 'scheduled', date: 'Fri 8:00 PM', author: 'Studio', venue: 'Main Stage', tickets: 240 },
  { id: 'e2', title: 'Members AMA', status: 'scheduled', date: 'Sat 6:00 PM', author: 'Team', venue: 'Discord', tickets: 150 },
  { id: 'e3', title: 'Tour Stop: Austin', status: 'scheduled', date: 'Nov 12, 7:30 PM', author: 'Tour', venue: 'Paramount', tickets: 980 },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export const demoEventCal: ContentEvent[] = [
  { id: '1', title: 'Friday Live', date: iso(new Date()), time: '20:00', type: 'publish' },
  { id: '2', title: 'Members AMA', date: iso(addDays(new Date(), 1)), time: '18:00', type: 'publish' },
  { id: '3', title: 'Tour Stop', date: iso(addDays(new Date(), 8)), time: '19:30', type: 'publish' },
  { id: '4', title: 'Announcement: New Tour', date: iso(addDays(new Date(), 3)), type: 'announcement' },
];

// Mock ticket sales (last 14 days)
export const demoTicketSalesDaily: number[] = [120, 180, 160, 220, 260, 240, 300, 280, 350, 370, 340, 390, 410, 460];

// Mock venue breakdown
export const demoVenueBreakdown: { name: string; events: number; tickets: number }[] = [
  { name: 'Main Stage', events: 6, tickets: 4250 },
  { name: 'Paramount', events: 4, tickets: 3720 },
  { name: 'The Forum', events: 3, tickets: 2880 },
  { name: 'Discord', events: 9, tickets: 1420 },
];

export function EventsOverviewSection({ upcoming }: { upcoming?: EventListItem[] }) {
  const stats = useMemo(() => ({
    total: 42,
    upcoming: upcoming?.length ?? 3,
    tickets: (upcoming ?? demoUpcoming).reduce((a, b) => a + (b.tickets ?? 0), 0),
    attendees: 18240,
  }), [upcoming]);

  const list = upcoming ?? demoUpcoming;

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={stats.total} icon={<CalendarDays className='h-4 w-4' />} />
        <StatCard title="Upcoming" value={stats.upcoming} />
        <StatCard title="Tickets (next)" value={stats.tickets} icon={<Ticket className='h-4 w-4' />} />
        <StatCard title="Attendees (est)" value={stats.attendees} icon={<Users className='h-4 w-4' />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket sales (14 days)</CardTitle>
            <CardDescription>Mock data trend; replace with live metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketSalesSparkline data={demoTicketSalesDaily} height={120} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venue breakdown</CardTitle>
            <CardDescription>Events and tickets by venue.</CardDescription>
          </CardHeader>
          <CardContent>
            <VenueBreakdown items={demoVenueBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
          <CardDescription>Events on the horizon.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='divide-y'>
            {list.map((e) => (
              <li key={e.id} className='flex items-center justify-between gap-3 py-2 text-sm'>
                <div className='min-w-0'>
                  <div className='truncate font-medium'>{e.title}</div>
                  <div className='text-muted-foreground truncate text-xs'>
                    {e.venue ?? '—'}
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge variant='secondary' className='capitalize'>{e.status}</Badge>
                  <div className='tabular-nums whitespace-nowrap'>{e.date}</div>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/events/${e.id}`}>Open</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div className='flex items-end justify-between gap-4'>
      <div>
        <h2 className='text-xl font-semibold tracking-tight'>Events Overview</h2>
        <p className='text-sm text-muted-foreground'>Manage shows, venues, and tickets.</p>
      </div>
      <div className='flex gap-2'>
        <Button asChild size='sm'><Link href='/events/create'>Create event</Link></Button>
        <Button asChild size='sm' variant='outline'><Link href='/settings/events'>Event settings</Link></Button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription className='flex items-center gap-2'>
          {icon}
          {title}
        </CardDescription>
        <CardTitle className='text-3xl'>{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-6' />
      </CardContent>
    </Card>
  );
}

function TicketSalesSparkline({ data, height = 100 }: { data: number[]; height?: number }) {
  if (!data?.length) return <div className='text-sm text-muted-foreground'>No data</div>;
  const w = Math.max(240, data.length * 20);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 8;
  const h = height;
  const norm = (v: number) => {
    if (max === min) return h / 2;
    const t = (v - min) / (max - min);
    return h - pad - t * (h - 2 * pad);
  };
  const step = (w - 2 * pad) / Math.max(1, data.length - 1);
  const points = data.map((v, i) => [pad + i * step, norm(v)] as const);
  const d = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
  const total = data.reduce((a, b) => a + b, 0);
  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;
  const delta = last - prev;

  return (
    <div>
      <div className='mb-2 flex items-baseline gap-2'>
        <div className='text-2xl font-semibold tabular-nums'>{total.toLocaleString()}</div>
        <div className='text-muted-foreground text-sm'>tickets in period</div>
        <div className={`text-sm ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{delta >= 0 ? '+' : ''}{delta}</div>
      </div>
      <svg width={w} height={h} className='max-w-full'>
        <defs>
          <linearGradient id='spark' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity='0.35' />
            <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity='0.02' />
          </linearGradient>
        </defs>
        <path d={d}
              fill='none'
              stroke='hsl(var(--primary))'
              strokeWidth='2'
              strokeLinejoin='round'
              strokeLinecap='round' />
        <path d={`${d} L ${pad + (data.length - 1) * step},${h - pad} L ${pad},${h - pad} Z`}
              fill='url(#spark)'
              stroke='none' />
      </svg>
    </div>
  );
}

function VenueBreakdown({ items }: { items: { name: string; events: number; tickets: number }[] }) {
  if (!items?.length) return <div className='text-sm text-muted-foreground'>No venues</div>;
  const maxTickets = Math.max(...items.map((x) => x.tickets));
  return (
    <div className='space-y-3'>
      {items.map((v) => (
        <div key={v.name} className='space-y-1'>
          <div className='flex items-center justify-between text-sm'>
            <div className='font-medium'>{v.name}</div>
            <div className='text-muted-foreground tabular-nums'>{v.events} ev · {v.tickets.toLocaleString()} tix</div>
          </div>
          <div className='h-2 w-full rounded bg-muted'>
            <div className='h-2 rounded bg-primary' style={{ width: `${Math.max(6, (v.tickets / Math.max(1, maxTickets)) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

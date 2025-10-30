// src/app/(dashboard)/settings/page.tsx
import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
	{
		title: 'General: Personalization',
		href: '/settings/general',
		desc: 'Customize platform name, theme, and branding defaults.',
	},
	{
		title: 'Subscriptions',
		href: '/settings/subscriptions',
		desc: 'Manage membership tiers, pricing, and payment providers.',
	},
	{
		title: 'Comments Settings',
		href: '/settings/comments',
		desc: 'Enable and configure community comments and moderation.',
	},
	{
		title: 'Content Settings',
		href: '/settings/content',
		desc: 'Define publishing options, categories, and permissions.',
	},
	{
		title: 'Notifications (future)',
		href: '/settings/notifications',
		desc: 'Control email, push, and in-app notifications.',
	},
	{
		title: 'Events (future)',
		href: '/settings/events',
		desc: 'Configure event listings and calendar integration.',
	},
];

export default function SettingsOverviewPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Platform Settings
				</h1>
				<p className="text-muted-foreground">
					Manage configuration for personalization, subscriptions, content, and
					more.
				</p>
			</div>

			<Separator />

			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{sections.map((s) => (
					<Link
						key={s.href}
						href={s.href}
					>
						<Card className="group h-full transition hover:border-primary">
							<CardHeader>
								<CardTitle className="group-hover:text-primary">
									{s.title}
								</CardTitle>
								<CardDescription>{s.desc}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-muted-foreground">
									Go to {s.title} →
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}

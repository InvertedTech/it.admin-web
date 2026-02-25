'use server';

import { getKpis } from '@/app/actions/dashboard';
import { ContentKpisCards } from './content-kpis';
import { SubscriptionsKpis } from './subscriptions-kpis';
import { UsersKpis } from './users-kpis';
import { Separator } from '../ui/separator';

export default async function DashboardServer() {
	const { Users, Subscriptions, Content } = await getKpis();
	return (
		<>
			{Users && (
				<div>
					<h2>User Metrics</h2>
					<Separator className='my-3' />

					<div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 auto-rows-fr items-stretch *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs'>
						<UsersKpis kpis={Users} />
					</div>
				</div>
			)}
			{Subscriptions && (
				<div>
					<h2>Subscription Metrics</h2>
					<Separator className='my-3' />

					<div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 auto-rows-fr items-stretch *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs'>
						<SubscriptionsKpis kpis={Subscriptions} />
					</div>
				</div>
			)}

			{Content && (
				<div>
					<h2>Content Metrics</h2>
					<Separator className='my-3' />

					<div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 auto-rows-fr items-stretch *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs'>
						<ContentKpisCards kpis={Content} />
					</div>
				</div>
			)}
		</>
	);
}

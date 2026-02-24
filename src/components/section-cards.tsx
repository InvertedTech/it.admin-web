import type { GetKpisResponse } from '@inverted-tech/fragments/Dashboard';
import { UsersKpis } from './dashboard/users-kpis';
import { SubscriptionsKpis } from './dashboard/subscriptions-kpis';
import { ContentKpisCards } from './dashboard/content-kpis';

type SectionCardsProps = {
	kpis?: GetKpisResponse;
};

export function SectionCards({ kpis }: SectionCardsProps) {
	return (
		<div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 auto-rows-fr items-stretch *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs'>
			{kpis?.Users && <UsersKpis kpis={kpis.Users} />}
			{kpis?.Subscriptions && (
				<SubscriptionsKpis kpis={kpis.Subscriptions} />
			)}
			{kpis?.Content && <ContentKpisCards kpis={kpis.Content} />}
		</div>
	);
}

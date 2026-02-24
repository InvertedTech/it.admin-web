import { UserKpis } from '@inverted-tech/fragments/Dashboard';
import { CountComparisonCard, RatioComparisonCard } from './metric-card';

export function UsersKpis({ kpis }: { kpis: UserKpis }) {
	return (
		<>
			<CountComparisonCard
				title='Total Users'
				metric={kpis?.TotalUsers}
				previousLabel='Previous users'
				className='h-full'
			/>
			<CountComparisonCard
				title='New Users'
				metric={kpis?.NewUsers}
				previousLabel='Previous New Users'
				className='h-full'
			/>
			<CountComparisonCard
				title='Disabled Users'
				metric={kpis?.DisabledUsers}
				previousLabel='Previous Disabled Users'
				className='h-full'
			/>
			<RatioComparisonCard
				title='Churn Rate'
				metric={kpis.ChurnRate}
				previousLabel='Previous Churn Rate'
				className='h-full'
			/>
		</>
	);
}

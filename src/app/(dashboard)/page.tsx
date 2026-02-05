import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { requireAnyRole } from '@/lib/rbac';

import data from '../data.json';

export default async function Page() {
	await requireAnyRole();
	// TODO: Put actual data in Section Cards
	// TODO: Put actual data in Data Table
	// TODO: Put actual data in Chart Area Interactive
	return (
		<div>
			<div className='space-y-6'>
				<SectionCards />
				<ChartAreaInteractive />
				<DataTable data={data} />
			</div>
		</div>
	);
}

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';

import data from '../data.json';

export default function Page() {
	return (
		<div>
			<div className="space-y-6">
				<SectionCards />
				<ChartAreaInteractive />
				<DataTable data={data} />
			</div>
		</div>
	);
}

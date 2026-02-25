'use server';

import { getWeekEvents } from '@/app/actions/content';
import { ContentWeekView } from '../content/content-week-view';

export async function ContentWeekViewServer() {
	const weekEvents = await getWeekEvents();

	return <ContentWeekView events={weekEvents} />;
}

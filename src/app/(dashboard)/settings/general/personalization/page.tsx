'use server';

import { getAdminSettings } from '@/app/actions/settings';
import { PersonalizationPublicForm } from '@/components/forms/personalization-public-settings-form';

export default async function SettingsGeneralPersonalizationPage() {
	const { Public } = await getAdminSettings();

	return (
		<>
			<h1 className="text-2xl font-semibold">
				settings/general/personalization
			</h1>
			<PersonalizationPublicForm data={Public?.Personalization} />
		</>
	);
}

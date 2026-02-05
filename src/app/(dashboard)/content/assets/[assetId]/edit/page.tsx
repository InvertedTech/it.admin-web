import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';

type Props = {
	params: Promise<{
		assetId: string;
	}>;
};

export default async function EditAssetPage({ params }: Props) {
	await requireRole(isWriterOrHigher);
	const assetId = await (await params).assetId;

	return (
		<>
			<h1>/asset/{assetId}/edit</h1>
		</>
	);
}

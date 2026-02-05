import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';

type Props = {
	params: Promise<{
		assetId: string;
	}>;
};

export default async function ViewAssetPage({ params }: Props) {
	await requireRole(isWriterOrHigher);
	const assetId = await (await params).assetId;

	// TODO: Implement an EditAssetForm
	return (
		<>
			<h1>/asset/{assetId}/edit</h1>
		</>
	);
}

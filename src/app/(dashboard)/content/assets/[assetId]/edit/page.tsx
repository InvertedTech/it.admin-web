type Props = {
	params: Promise<{
		assetId: string;
	}>;
};

export default async function EditAssetPage({ params }: Props) {
	const assetId = await (await params).assetId;

	return (
		<>
			<h1>/asset/{assetId}/edit</h1>
		</>
	);
}

'use server';

import { searchAssets, getAsset } from '@/app/actions/assets';
import { AssetType } from '@inverted-tech/fragments/Content/AssetInterface_pb';
import type {
	ImageAssetPublicRecord,
	ImageAssetPublicData,
} from '@inverted-tech/fragments/Content/ImageAssetRecord_pb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/assets/audio-player';
import { ImageAssetModal } from '@/components/assets/image-asset-modal';
import { UploadAssetButton } from '@/components/assets/upload-asset-button';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';
import { getApiBase } from '@/lib/apiBase';

export default async function AssetIndexPage() {
	await requireRole(isWriterOrHigher);

	return (
		<div>
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
					<p className="text-muted-foreground">Browse uploaded assets.</p>
				</div>
				<UploadAssetButton />
			</div>

			<AssetsGallery />
		</div>
	);
}

type GalleryItem =
	| { type: 'image'; record: ImageAssetPublicRecord; src: string | null }
	| { type: 'audio'; record: any };

async function AssetsGallery() {
	const [imagesRes, audioRes] = await Promise.all([
		searchAssets({ AssetType: AssetType.AssetImage }),
		searchAssets({ AssetType: AssetType.AssetAudio }),
	]);
	const images = ((imagesRes as any)?.Records ?? []) as ImageAssetPublicRecord[];
	const audio = ((audioRes as any)?.Records ?? []) as any[];
	const imageItems = await Promise.all(
		images.map(async (record) => ({
			type: 'image' as const,
			record,
			src: await getImageSrc(record),
		}))
	);
	const items: GalleryItem[] = [
		...imageItems,
		...audio.map((record) => ({ type: 'audio' as const, record })),
	];

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{items.map((item) => (
				<Card
					key={item.record.AssetID}
					className="overflow-hidden"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium line-clamp-1">
							{(item.record as any).Title || 'Untitled'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{item.type === 'image' ? (
							<>
								<ImageAssetModal
									src={item.src}
									title={(item.record as any).Title || 'Image'}
								/>
								<div className="mt-2 text-xs text-muted-foreground">
									{(item.record as any).Width && (item.record as any).Height
										? `${(item.record as any).Width}x${(item.record as any).Height}px`
										: '-'}
								</div>
							</>
						) : (
							<>
								<div className="rounded-md border p-3">
									<AssetAudioPlayer assetId={item.record.AssetID} />
									<div className="mt-2 text-xs text-muted-foreground">
										{typeof item.record.LengthSeconds === 'number' &&
										item.record.LengthSeconds > 0
											? `${item.record.LengthSeconds}s`
											: '-'}
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			))}
			{items.length === 0 && (
				<div className="text-muted-foreground">No assets found.</div>
			)}
		</div>
	);
}

function srcFromRecord(
	r: ImageAssetPublicRecord | ImageAssetPublicData
): string | null {
	// Prefer explicit URL if provided
	const direct =
		(r as any)?.URL ||
		(r as any)?.Url ||
		(r as any)?.Public?.Data?.URL ||
		(r as any)?.Data?.URL ||
		(r as any)?.public?.data?.url;
	if (typeof direct === 'string' && direct.length > 0) return direct;

	// Support inline base64 image data
	const dataObj =
		(r as any)?.Public?.Data ||
		(r as any)?.Data ||
		(r as any)?.public?.data ||
		(r as any)?.data;
	let base64: string | undefined;
	const raw = dataObj?.Data ?? dataObj?.data;
	if (typeof raw === 'string') {
		base64 = raw;
	} else if (raw && typeof raw === 'object' && 'byteLength' in raw) {
		try {
			base64 = Buffer.from(raw as Uint8Array).toString('base64');
		} catch {}
	}
	const mime =
		dataObj?.MimeType ?? dataObj?.mimeType ?? dataObj?.mime_type ?? 'image/png';
	if (typeof base64 === 'string' && base64.length > 0) {
		return `data:${mime};base64,${base64}`;
	}

	// Fallback to service route
	if ((r as any)?.AssetID) {
		const base = getApiBase();
		if (base)
			return `${base}/cms/asset/image/${(r as any).AssetID}/data`;
	}
	return null;
}

async function getImageSrc(record: ImageAssetPublicRecord): Promise<string | null> {
	const direct = srcFromRecord(record);
	if (direct && (direct.startsWith('data:') || direct.startsWith('blob:'))) {
		return direct;
	}

	const assetId = (record as any)?.AssetID as string | undefined;
	if (assetId) {
		return `/api/assets/image/${assetId}/data`;
	}

	if (direct) return direct;

	const admin = await getAsset((record as any)?.AssetID);
	const inlined = extractImageData(admin);
	if (inlined?.base64) {
		return `data:${inlined.mime || 'image/png'};base64,${inlined.base64}`;
	}
	return null;
}

function extractImageData(admin: any): { base64?: string | null; mime?: string | null } {
	const rec = admin?.Record ?? admin?.record ?? admin?.data ?? admin;
	const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
	if (one?.case === 'Image' || one?.case === 'image') {
		const imageVal = one?.value ?? {};
		const pub = imageVal?.Public ?? imageVal?.public ?? imageVal;
		const dataObj = pub?.Data ?? pub?.data ?? pub?.Public?.Data ?? {};
		const base64 = (dataObj?.Data ?? dataObj?.data) as string | undefined;
		const mime = (dataObj?.MimeType ?? dataObj?.mimeType ?? dataObj?.mime_type) || 'image/png';
		if (typeof base64 === 'string' && base64.length > 0) return { base64, mime };
	}
	const imageRec = rec?.Image ?? rec?.image;
	if (imageRec) {
		const pub = imageRec?.Public ?? imageRec?.public ?? imageRec;
		const dataObj = pub?.Data ?? pub?.data ?? {};
		const base64 = (dataObj?.Data ?? dataObj?.data) as string | undefined;
		const mime = (dataObj?.MimeType ?? dataObj?.mimeType ?? dataObj?.mime_type) || 'image/png';
		if (typeof base64 === 'string' && base64.length > 0) return { base64, mime };
	}
	return { base64: undefined, mime: undefined };
}

async function AssetAudioPlayer({ assetId }: { assetId: string }) {
	const admin = await getAsset(assetId);
	const { dataBase64, mimeType } = extractAudioData(admin);
	return (
		<AudioPlayer
			dataBase64={dataBase64}
			mimeType={mimeType}
		/>
	);
}

function extractAudioData(admin: any): {
	dataBase64?: string | null;
	mimeType?: string | null;
} {
	// Support multiple response shapes: Protobuf JSON (PascalCase) and REST (lowerCamel / lower)
	const rec = admin?.Record ?? admin?.record ?? admin?.data ?? admin;

	// Case 1: oneof shape from proto JSON
	const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
	if (one?.case === 'Audio' || one?.case === 'audio') {
		const audioVal = one?.value ?? {};
		const pub = audioVal?.Public ?? audioVal?.public ?? audioVal;
		const dataObj = pub?.Data ?? pub?.data ?? pub?.Public?.Data ?? {};
		const base64 = (dataObj?.Data ?? dataObj?.data) as string | undefined;
		const mime =
			(dataObj?.MimeType ?? dataObj?.mimeType ?? dataObj?.mime_type) ||
			'audio/mpeg';
		if (typeof base64 === 'string' && base64.length > 0) {
			return { dataBase64: base64, mimeType: String(mime) };
		}
	}

	// Case 2: flattened record with explicit audio key
	const audioRec = rec?.Audio ?? rec?.audio;
	if (audioRec) {
		const pub = audioRec?.Public ?? audioRec?.public ?? audioRec;
		const dataObj = pub?.Data ?? pub?.data ?? {};
		const base64 = (dataObj?.Data ?? dataObj?.data) as string | undefined;
		const mime =
			(dataObj?.MimeType ?? dataObj?.mimeType ?? dataObj?.mime_type) ||
			'audio/mpeg';
		if (typeof base64 === 'string' && base64.length > 0) {
			return { dataBase64: base64, mimeType: String(mime) };
		}
	}

	return { dataBase64: undefined, mimeType: undefined };
}

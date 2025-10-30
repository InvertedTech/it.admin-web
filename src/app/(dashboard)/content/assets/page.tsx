'use server';

import Link from 'next/link';
import Image from 'next/image';
import { searchAssets, getAsset } from '@/app/actions/assets';
import { AssetType } from '@inverted-tech/fragments/Content/AssetInterface_pb';
import type {
	ImageAssetPublicRecord,
	ImageAssetPublicData,
} from '@inverted-tech/fragments/Content/ImageAssetRecord_pb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/assets/audio-player';

export default async function AssetIndexPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const sp = await searchParams;
	const tab = (sp?.tab ?? 'images').toLowerCase();

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
				<p className="text-muted-foreground">Browse uploaded assets.</p>
			</div>

			<TabNav active={tab} />

			{tab === 'images' ? <ImagesTab /> : <AudioTab />}
		</div>
	);
}

function TabNav({ active }: { active: string }) {
	const base = '/asset';
	const linkCls = (id: string) =>
		`inline-flex items-center rounded-md border px-3 py-1.5 text-sm ${
			active === id
				? 'bg-primary text-primary-foreground border-primary'
				: 'bg-background hover:bg-accent border-input'
		}`;
	return (
		<div className="flex gap-2">
			<Link
				className={linkCls('images')}
				href={`${base}?tab=images`}
				prefetch
			>
				Images
			</Link>
			<Link
				className={linkCls('audio')}
				href={`${base}?tab=audio`}
				prefetch
			>
				Audio
			</Link>
		</div>
	);
}

async function ImagesTab() {
	const res = await searchAssets({ AssetType: AssetType.AssetImage });
	const records = (res as any)?.Records ?? [];
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{records.map((r: any) => (
				<Card
					key={r.AssetID}
					className="overflow-hidden"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium line-clamp-1">
							{r.Title || 'Untitled'}
						</CardTitle>
					</CardHeader>
					<CardContent>
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted">
                            <AssetImage record={r as unknown as ImageAssetPublicRecord} />
                        </div>
						<div className="mt-2 text-xs text-muted-foreground">
							{r.Width && r.Height ? `${r.Width}×${r.Height}px` : '—'}
						</div>
					</CardContent>
				</Card>
			))}
			{records.length === 0 && (
				<div className="text-muted-foreground">No images found.</div>
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
	if ((r as any)?.AssetID)
		return `http://localhost:8001/api/cms/asset/image/${
			(r as any).AssetID
		}/data`;
	return null;
}

async function AssetImage({ record }: { record: ImageAssetPublicRecord }) {
    const alt = (record as any)?.Title || (record as any)?.Data?.Title || 'Image';
    const direct = srcFromRecord(record);
    if (direct && direct.startsWith('data:')) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={direct} alt={alt} className="h-full w-full object-cover" />;
    }
    const admin = await getAsset((record as any)?.AssetID);
    const inlined = extractImageData(admin);
    if (inlined?.base64) {
        const src = `data:${inlined.mime || 'image/png'};base64,${inlined.base64}`;
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} className="h-full w-full object-cover" />;
    }
    if (direct) {
        return (
            <Image
                src={direct}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                style={{ objectFit: 'cover' }}
            />
        );
    }
    return (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No preview
        </div>
    );
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

async function AudioTab() {
	const res = await searchAssets({ AssetType: AssetType.AssetAudio });
	console.log(res);
	const records = (res as any)?.Records ?? [];
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{records.map((r: any) => (
				<Card
					key={r.AssetID}
					className="overflow-hidden"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium line-clamp-1">
							{r.Title || 'Untitled'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border p-3">
							<AssetAudioPlayer assetId={r.AssetID} />
							<div className="mt-2 text-xs text-muted-foreground">
								{typeof r.LengthSeconds === 'number' && r.LengthSeconds > 0
									? `${r.LengthSeconds}s`
									: '—'}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
			{records.length === 0 && (
				<div className="text-muted-foreground">No audio assets found.</div>
			)}
		</div>
	);
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

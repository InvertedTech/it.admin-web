// components/content/content-data.tsx
'use client';

import type {
	ContentPublicData,
	ContentPrivateData,
	VideoContentPublicData,
	WrittenContentPublicData,
	PictureContentPublicData,
	AudioContentPublicData,
} from '@inverted-tech/fragments/Content'; // adjust import path to your gen
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type Props = {
	pubData?: Partial<ContentPublicData> | any;
	privData?: Partial<ContentPrivateData> | any;
};

export function ContentData({ pubData, privData }: Props) {
	// Prefer typed oneof when present; fall back to legacy shape { Video: {...} }
	let typeLabel: string | undefined;
	let value: any;

	if (pubData?.ContentDataOneof?.case) {
		typeLabel = pubData.ContentDataOneof.case;
		value = pubData.ContentDataOneof.value;
	} else if (privData?.ContentDataOneof?.case) {
		typeLabel = privData.ContentDataOneof.case;
		value = privData.ContentDataOneof.value;
	} else {
		// legacy: properties directly under data: Video | Written | Picture | Audio
		for (const k of ['Video', 'Written', 'Picture', 'Audio'] as const) {
			if (pubData?.[k]) {
				typeLabel = k;
				value = pubData[k];
				break;
			}
			if (!value && privData?.[k]) {
				typeLabel = k;
				value = privData[k];
			}
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Content Data</CardTitle>
				<CardDescription>
					Type-specific fields provided for this content.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{typeLabel && value ? (
					<div className="space-y-3">
						<div className="text-sm text-muted-foreground">Type</div>
						<div className="font-medium">{typeLabel}</div>

						{/* Written */}
						{'HtmlBody' in value && value.HtmlBody ? (
							<div>
								<div className="text-sm text-muted-foreground">Body</div>
								<div className="prose mt-1 max-w-none whitespace-pre-wrap break-words dark:prose-invert">
									{value.HtmlBody}
								</div>
							</div>
						) : null}

						{/* Video */}
						{'RumbleVideoId' in value && value.RumbleVideoId ? (
							<KV
								k="Rumble Video ID"
								v={value.RumbleVideoId}
								mono
							/>
						) : null}
						{'YoutubeVideoId' in value && value.YoutubeVideoId ? (
							<KV
								k="YouTube Video ID"
								v={value.YoutubeVideoId}
								mono
							/>
						) : null}
						{'IsLiveStream' in value ? (
							<KV
								k="Is Live Stream"
								v={String(!!value.IsLiveStream)}
							/>
						) : null}
						{'IsLive' in value ? (
							<KV
								k="Is Live"
								v={String(!!value.IsLive)}
							/>
						) : null}

						{/* Audio */}
						{'AudioAssetID' in value && value.AudioAssetID ? (
							<KV
								k="Audio Asset ID"
								v={value.AudioAssetID}
								mono
							/>
						) : null}

						{/* Picture */}
						{'ImageAssetIDs' in value &&
						Array.isArray(value.ImageAssetIDs) &&
						value.ImageAssetIDs.length ? (
							<div>
								<div className="text-sm text-muted-foreground">
									Image Asset IDs
								</div>
								<div className="mt-1 font-mono text-sm break-all">
									{value.ImageAssetIDs.join(', ')}
								</div>
							</div>
						) : null}

						{/* Fallback */}
						{noKnownFields(value) ? (
							<div className="text-muted-foreground">
								No type-specific fields.
							</div>
						) : null}
					</div>
				) : (
					<div className="text-muted-foreground">
						No content data available.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function KV({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
	return (
		<div>
			<div className="text-sm text-muted-foreground">{k}</div>
			<div className={`mt-0.5 ${mono ? 'font-mono text-sm break-all' : ''}`}>
				{v}
			</div>
		</div>
	);
}

function noKnownFields(obj: any) {
	return (
		!obj?.HtmlBody &&
		!obj?.RumbleVideoId &&
		!obj?.YoutubeVideoId &&
		!obj?.AudioAssetID &&
		!(Array.isArray(obj?.ImageAssetIDs) && obj.ImageAssetIDs.length) &&
		typeof obj?.IsLiveStream === 'undefined' &&
		typeof obj?.IsLive === 'undefined'
	);
}

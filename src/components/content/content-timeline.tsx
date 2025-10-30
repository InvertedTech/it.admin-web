// components/content/content-timeline.tsx
'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { PublishContentForm } from '@/components/forms/publish-content-form';
import { AnnounceContentForm } from '@/components/forms/announce-content-form';

type MaybeTimestamp = unknown;

type Props = {
	contentId: string;
	createdOn?: MaybeTimestamp;
	publishOn?: MaybeTimestamp;
	pinnedOn?: MaybeTimestamp;
	announceOn?: MaybeTimestamp;
};

export function ContentTimeline({
	contentId,
	createdOn,
	publishOn,
	announceOn,
	pinnedOn,
}: Props) {
	const router = useRouter();
    const [isUnpublishing, setUnpublishing] = useState(false);
    const [isUnannouncing, setUnannouncing] = useState(false);

	function toJsDate(value: MaybeTimestamp): Date | undefined {
		if (!value) return;
		if (value instanceof Date) return value;
		if (typeof value === 'string') {
			const d = new Date(value);
			return Number.isNaN(d.getTime()) ? undefined : d;
		}
		if (typeof value === 'object' && value && 'seconds' in (value as any)) {
			const s = Number((value as any).seconds ?? 0);
			const n = Number((value as any).nanos ?? 0);
			const d = new Date(s * 1000 + Math.floor(n / 1_000_000));
			return Number.isNaN(d.getTime()) ? undefined : d;
		}
	}
	function fmtDate(input?: MaybeTimestamp) {
		const d = input ? toJsDate(input) : undefined;
		return d ? d.toLocaleString() : '—';
	}
    const hasPublish = Boolean(toJsDate(publishOn));
    const hasAnnounce = Boolean(toJsDate(announceOn));

    async function doUnpublish() {
        if (isUnpublishing) return;
        setUnpublishing(true);
        try {
            const res = await fetch(`/api/admin/content/${contentId}/unpublish`, {
                method: 'POST',
            });
            if (!res.ok) {
                // eslint-disable-next-line no-console
                console.error('Unpublish failed', res.status);
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Unpublish error', e);
        } finally {
            try { router.refresh(); } catch {}
            setUnpublishing(false);
        }
    }

    async function doUnannounce() {
        if (isUnannouncing) return;
        setUnannouncing(true);
        try {
            const res = await fetch(`/api/admin/content/${contentId}/unannounce`, {
                method: 'POST',
            });
            if (!res.ok) {
                // eslint-disable-next-line no-console
                console.error('Unannounce failed', res.status);
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Unannounce error', e);
        } finally {
            try { router.refresh(); } catch {}
            setUnannouncing(false);
        }
    }

	return (
		<Card>
			<CardHeader>
				<CardTitle>Timeline</CardTitle>
				<CardDescription>Key timestamps for this content.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Created</div>
						<div className="mt-1">{fmtDate(createdOn)}</div>
					</div>

					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Publish</div>
						<div className="mt-1">
						{hasPublish ? (
							<div className="flex items-center gap-2">
								<span>{fmtDate(publishOn)}</span>
								<Button
									variant="outline"
									size="sm"
									disabled={isUnpublishing}
									onClick={doUnpublish}
								>
									Unpublish
								</Button>
							</div>
						) : (
							<Dialog>
								<DialogTrigger asChild>
									<Button size="sm">Set publish date</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Publish content</DialogTitle>
									</DialogHeader>
									<PublishContentForm contentId={contentId} />
								</DialogContent>
							</Dialog>
						)}
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<div className="text-sm text-muted-foreground">Pinned</div>
						<div className="mt-1">{fmtDate(pinnedOn)}</div>
					</div>

                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Announce</div>
                        <div className="mt-1">
                            {hasAnnounce ? (
                                <div className="flex items-center gap-2">
                                    <span>{fmtDate(announceOn)}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isUnannouncing}
                                        onClick={doUnannounce}
                                    >
                                        Unannounce
                                    </Button>
                                </div>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm">Set announce date</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Announce content</DialogTitle>
                                        </DialogHeader>
                                        <AnnounceContentForm contentId={contentId} />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
				</div>
			</CardContent>
		</Card>
	);
}

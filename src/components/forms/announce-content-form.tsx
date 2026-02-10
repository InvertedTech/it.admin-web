import { announceContent } from '@/app/actions/content';
import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { AnnounceContentRequestSchema } from '@inverted-tech/fragments/Content';
import { useRouter } from 'next/navigation';

function formatMaybeTimestamp(value: any): string | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value.toLocaleString();
	if (typeof value === 'string') {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? undefined : d.toLocaleString();
	}
	if (typeof value === 'object' && value !== null) {
		if (typeof value.toDate === 'function') {
			try {
				const d = value.toDate();
				if (d instanceof Date && !Number.isNaN(d.getTime()))
					return d.toLocaleString();
			} catch {}
		}
		if ('seconds' in value) {
			const seconds = Number((value as any).seconds);
			const nanos = Number((value as any).nanos ?? 0);
			if (Number.isFinite(seconds)) {
				const d = new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
				return Number.isNaN(d.getTime()) ? undefined : d.toLocaleString();
			}
		}
	}
	return undefined;
}

export function AnnounceContentForm({
	contentId,
	onComplete,
}: {
	contentId?: string;
	onComplete?: (info?: { when?: string }) => void;
}) {
	const router = useRouter();
	const form = useAppForm({
		defaultValues: {
			ContentID: contentId ?? '',
			AnnounceOnUTC: undefined,
		} as Record<string, any>,
		onSubmit: async ({ value }) => {
			try {
				const req = create(AnnounceContentRequestSchema as any, value as any);
				await announceContent(req as any);
				try {
					router.refresh();
					onComplete?.({
						when: formatMaybeTimestamp((value as any)?.AnnounceOnUTC),
					});
				} catch {}
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
			}
		},
	});

	return (
		<form
			id="announce-content"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<form.AppField name="ContentID">
					{(f: any) => (
						<f.TextField
							label={'Content ID'}
							disabled={Boolean(contentId)}
							hidden
						/>
					)}
				</form.AppField>
				<form.AppField
					name="AnnounceOnUTC"
					children={(f: any) => (
						<f.DateTimeField
							label="Announce On"
							defaultToNow
						/>
					)}
				/>
				<form.CreateButton label="Announce" />
			</form.AppForm>
		</form>
	);
}

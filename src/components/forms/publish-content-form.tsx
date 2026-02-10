import { create } from '@bufbuild/protobuf';
import { useRouter } from 'next/navigation';
import { publishContent } from '@/app/actions/content';
import { PublishContentRequestSchema } from '@inverted-tech/fragments/Content';
import { useAppForm } from '@/hooks/app-form';

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

export function PublishContentForm({
	contentId,
	onComplete,
}: {
	contentId: string;
	onComplete?: (info?: { when?: string }) => void;
}) {
	const router = useRouter();
	const form = useAppForm({
		defaultValues: {
			ContentID: contentId,
			PublishOnUTC: { seconds: 0, nanos: 0 } as any,
		} as Record<string, any>,
		onSubmit: async ({ value }) => {
			const req = create(PublishContentRequestSchema as any, value as any);
			const res = await publishContent(req as any);
			try {
				if (res?.Record) {
					router.refresh();
					onComplete?.({
						when: formatMaybeTimestamp((value as any)?.PublishOnUTC),
					});
				}
			} catch {}
		},
	});

	return (
		<form
			id="publish-content"
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
					name="PublishOnUTC"
					children={(f: any) => <f.DateTimeField label="Publishing Date" />}
				/>
				<form.CreateButton label="Publish" />
			</form.AppForm>
		</form>
	);
}

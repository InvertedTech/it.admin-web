import { announceContent } from '@/app/actions/content';
import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	AnnounceContentRequestSchema,
	AnnounceContentRequest,
	AnnounceContentResponse,
} from '@inverted-tech/fragments/Content';

export function AnnounceContentForm({ contentId }: { contentId?: string }) {
	const form = useAppForm({
		defaultValues: {
			ContentID: contentId ?? '',
			AnnounceOnUTC: { seconds: 0, nanos: 0 } as any,
		} as Record<string, any>,
		onSubmit: async ({ value }) => {
			try {
				const req = create(AnnounceContentRequestSchema as any, value as any);
				const res = await announceContent(req as any);
				// eslint-disable-next-line no-console
				console.log(res);
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
					children={(f: any) => <f.DateTimeField label="Announce On" />}
				/>
				<form.CreateButton label="Announce" />
			</form.AppForm>
		</form>
	);
}

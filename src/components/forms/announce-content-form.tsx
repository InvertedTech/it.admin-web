import { announceContent } from '@/app/actions/content';
import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { AnnounceContentRequestSchema } from '@inverted-tech/fragments/Content';

export function AnnounceContentForm({ contentId }: { contentId?: string }) {
	const form = useAppForm({
		defaultValues: {
			ContentID: contentId ?? '',
			AnnounceOnUTC: undefined,
		} as Record<string, any>,
		onSubmit: async ({ value }) => {
			try {
				const req = create(
					AnnounceContentRequestSchema as any,
					value as any,
				);
				const res = await announceContent(req as any);
				// eslint-disable-next-line no-console
				// TODO: Handle Response
				console.log(res);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
			}
		},
	});

	return (
		<form
			id='announce-content'
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<form.AppField name='ContentID'>
					{(f: any) => (
						<f.TextField
							label={'Content ID'}
							disabled={Boolean(contentId)}
							hidden
						/>
					)}
				</form.AppField>
				<form.AppField
					name='AnnounceOnUTC'
					children={(f: any) => (
						<f.DateTimeField label='Announce On' defaultToNow />
					)}
				/>
				<form.CreateButton label='Announce' />
			</form.AppForm>
		</form>
	);
}

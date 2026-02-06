import { create } from '@bufbuild/protobuf';
import { useRouter } from 'next/navigation';
import { publishContent } from '@/app/actions/content';
import { PublishContentRequestSchema } from '@inverted-tech/fragments/Content';
import { useAppForm } from '@/hooks/app-form';

export function PublishContentForm({ contentId }: { contentId: string }) {
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
				if (res?.Record) router.refresh();
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

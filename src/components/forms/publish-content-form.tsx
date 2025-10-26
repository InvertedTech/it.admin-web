import { create } from '@bufbuild/protobuf';
import { publishContent } from '@/app/actions/content';
import {
	PublishContentRequestSchema,
	PublishContentRequest,
	PublishContentResponse,
} from '@inverted-tech/fragments/Content';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';

export function PublishContentForm({ contentId }: { contentId: string }) {
	const form = useProtoAppForm({
		schema: PublishContentRequestSchema,
		defaultValues: create(PublishContentRequestSchema, {
			ContentID: contentId,
		}),
		onSubmitAsync: async ({ value }) => {
			const res = await publishContent(value);
		},
	});

	return (
		<form>
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

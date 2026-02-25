'use client';

import { create } from '@bufbuild/protobuf';
import { createCommentForContent } from '@/app/actions/comments';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { useRouter } from 'next/navigation';
import {
	CreateCommentForContentRequest,
	CreateCommentForContentRequestSchema,
} from '@inverted-tech/fragments/Comment';
import { CreateCommentForContentFields } from './groups/comments/create-comment-fields';

export function CreateCommentForContentForm({
	contentId,
	onComplete,
}: {
	contentId: string;
	onComplete?: () => void;
}) {
	const router = useRouter();
	const fields = {
		ContentID: 'ContentID',
		Text: 'Text',
	} as const;
	const form = useProtoAppForm({
		schema: CreateCommentForContentRequestSchema,
		defaultValues: create(CreateCommentForContentRequestSchema, {
			ContentID: contentId,
		}),
		onSubmitAsync: async ({ value }) => {
			const payload = create(
				CreateCommentForContentRequestSchema,
				value as CreateCommentForContentRequest,
			);
			const res = await createCommentForContent(payload);

			if (res?.Error?.Message) {
				return { form: res.Error.Message };
			}

			router.refresh();
			onComplete?.();
			return undefined;
		},
	});

	return (
		<form
			id='create-comment-for-content-form'
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<CreateCommentForContentFields form={form} fields={fields as any} />
				<form.CreateButton label='Create Comment' />
			</form.AppForm>
		</form>
	);
}

'use client';

import { create } from '@bufbuild/protobuf';
import { createCommentForComment } from '@/app/actions/comments';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { useRouter } from 'next/navigation';
import {
	CreateCommentForCommentRequest,
	CreateCommentForCommentRequestSchema,
} from '@inverted-tech/fragments/Comment';
import { CreateCommentForCommentFields } from './groups/comments/create-comment-fields';

export function CreateCommentForCommentForm({
	parentCommentId,
	onComplete,
}: {
	parentCommentId: string;
	onComplete?: () => void;
}) {
	const router = useRouter();
	const fields = {
		ParentCommentID: 'ParentCommentID',
		Text: 'Text',
	} as const;
	const form = useProtoAppForm({
		schema: CreateCommentForCommentRequestSchema,
		defaultValues: create(CreateCommentForCommentRequestSchema, {
			ParentCommentID: parentCommentId,
		}),
		onSubmitAsync: async ({ value }) => {
			const payload = create(
				CreateCommentForCommentRequestSchema,
				value as CreateCommentForCommentRequest,
			);
			const res = await createCommentForComment(payload);

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
			id='create-comment-for-comment-form'
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<CreateCommentForCommentFields form={form} fields={fields as any} />
				<form.CreateButton label='Reply' />
			</form.AppForm>
		</form>
	);
}

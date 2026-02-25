import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	CreateCommentForCommentRequestSchema,
	CreateCommentForContentRequestSchema,
} from '@inverted-tech/fragments/Comment';

export const CreateCommentForContentFields = withFieldGroup({
	defaultValues: create(CreateCommentForContentRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='ContentID'
					children={(f) => <f.HiddenField />}
				/>
				<group.AppField
					name='Text'
					children={(f) => <f.TextAreaField label='Text' />}
				/>
			</FieldGroup>
		);
	},
});

export const CreateCommentForCommentFields = withFieldGroup({
	defaultValues: create(CreateCommentForCommentRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='ParentCommentID'
					children={(f) => <f.HiddenField />}
				/>

				<group.AppField
					name='Text'
					children={(f) => <f.TextAreaField label='Text' />}
				/>
			</FieldGroup>
		);
	},
});

import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import {
	CommentsPrivateRecordSchema,
	CommentsPublicRecordSchema,
} from '@inverted-tech/fragments/Settings';
import { FormCard } from './form-card';
import commentsGroups, {
	CommentPrivateSettingsFieldGroup,
} from './groups/settings/comment-settings-field-groups';

const PUBLIC_FIELDS_MAP = {
	$typeName: '$typeName',
	AllowLinks: 'AllowLinks',
	DefaultOrder: 'DefaultOrder',
	DefaultRestriction: 'DefaultRestriction',
	ExplicitModeEnabled: 'ExplicitModeEnabled',
} as const;

const PRIVATE_FIELDS_MAP = {
	$typeName: '$typeName',
	BlackList: 'BlackList',
} as const;

export function CommentsPublicSettingsForm() {
	const form = useProtoAppForm({
		schema: CommentsPublicRecordSchema,
		defaultValues: create(CommentsPublicRecordSchema),
		onSubmitAsync: async ({ value }) => console.log(value),
	});

	return (
		<FormCard
			cardTitle="Public"
			cardDescription="Public Settings For Comments"
		>
			<form
				id="comments-settings-public"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<commentsGroups.CommentPublicSettingsFieldGroup
						title="Public Settings"
						form={form}
						fields={PUBLIC_FIELDS_MAP as any}
					/>
					<form.CreateButton label="Save" />
					<form.ResetButton />
				</form.AppForm>
			</form>
		</FormCard>
	);
}

export function CommentsPrivateSettingsForm() {
	const form = useProtoAppForm({
		schema: CommentsPrivateRecordSchema,
		defaultValues: create(CommentsPrivateRecordSchema),
		onSubmitAsync: async ({ value }) => console.log(value),
	});

	return (
		<FormCard
			cardTitle="Private"
			cardDescription="Server-only moderation settings"
		>
			<form
				id="comments-settings-private"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.AppForm>
					<CommentPrivateSettingsFieldGroup
						form={form}
						title="Private Settings"
						fields={PRIVATE_FIELDS_MAP as any}
						suggestions={['spam', 'scam', 'self-promo']}
					/>
					<form.CreateButton label="Save" />
				</form.AppForm>
			</form>
		</FormCard>
	);
}

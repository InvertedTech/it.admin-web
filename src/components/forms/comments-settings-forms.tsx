'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { SettingsForm, SettingsSection } from '@/components/settings';
import {
	CommentsPrivateRecordSchema,
	CommentsPublicRecordSchema,
} from '@inverted-tech/fragments/Settings';

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
		<SettingsForm form={form}>
			<SettingsSection
				title="Comments — Public"
				description="Controls visible to all visitors."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<commentsGroups.CommentPublicSettingsFieldGroup
						title=""
						form={form}
						fields={PUBLIC_FIELDS_MAP as any}
					/>
				</div>
			</SettingsSection>
		</SettingsForm>
	);
}

export function CommentsPrivateSettingsForm() {
	const form = useProtoAppForm({
		schema: CommentsPrivateRecordSchema,
		defaultValues: create(CommentsPrivateRecordSchema),
		onSubmitAsync: async ({ value }) => console.log(value),
	});

	return (
		<SettingsForm form={form}>
			<SettingsSection
				title="Comments — Private"
				description="Server-only moderation settings."
			>
				<div className="grid gap-4">
					<CommentPrivateSettingsFieldGroup
						form={form}
						title=""
						fields={PRIVATE_FIELDS_MAP as any}
						suggestions={['spam', 'scam', 'self-promo']}
					/>
				</div>
			</SettingsSection>
		</SettingsForm>
	);
}

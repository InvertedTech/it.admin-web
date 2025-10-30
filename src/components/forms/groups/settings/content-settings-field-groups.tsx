import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	CategoryRecordSchema,
	ChannelRecordSchema,
	CMSPublicMenuRecordSchema,
} from '@inverted-tech/fragments/Settings';
import { useStore } from '@tanstack/react-form';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

const toSlug = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/--+/g, '-');

function getIn(obj: any, path: string) {
	return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function pathOf(group: any, leaf: string) {
	const base = group?.fields?.name ? String(group.fields.name) : '';
	return base ? `${base}.${leaf}` : leaf;
}

export const ChannelFieldGroup = withFieldGroup({
	defaultValues: create(ChannelRecordSchema),
	render: function Render({ group }) {
		// subscribe to current row’s ChannelId
		const channelId = useStore(
			group.form.store as any,
			(s: any) => getIn(s?.values, pathOf(group, 'ChannelId')) ?? ''
		);

		// ensure ChannelId exists
		React.useEffect(() => {
			if (!channelId) {
				group.form.setFieldValue(pathOf(group, 'ChannelId') as any, uuidv4());
			}
		}, [channelId, group]);

		return (
			<FieldGroup>
				<group.AppField name="ChannelId">
					{(f) => (
						<f.TextField
							label="Id"
							disabled
						/>
					)}
				</group.AppField>
				<group.AppField name="ParentChannelId">
					{(f) => (
						<f.TextField
							label="Parent Id"
							disabled
						/>
					)}
				</group.AppField>
				<group.AppField name="DisplayName">
					{(f) => <f.TextField label="Display Name" />}
				</group.AppField>
				<group.AppField name="UrlStub">
					{(f) => <f.TextField label="Url Stub" />}
				</group.AppField>
				<group.AppField name="ImageAssetId">
					{(f) => <f.ImagePickerField label="Image" />}
				</group.AppField>
				<group.AppField name="YoutubeUrl">
					{(f) => <f.TextField label="Youtube URL" />}
				</group.AppField>
				<group.AppField name="RumbleUrl">
					{(f) => <f.TextField label="Rumble URL" />}
				</group.AppField>
				<group.AppField name="OldChannelId">
					{(f) => (
						<f.TextField
							label="Old Id"
							disabled
						/>
					)}
				</group.AppField>
			</FieldGroup>
		);
	},
});

export const CategoryFieldGroup = withFieldGroup({
	defaultValues: create(CategoryRecordSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name="CategoryId"
					children={(f) => (
						<f.TextField
							label="Id"
							disabled
						/>
					)}
				/>
				<group.AppField
					name="ParentCategoryId"
					children={(f) => (
						<f.TextField
							label="Parent Id"
							disabled
						/>
					)}
				/>
				<group.AppField
					name="DisplayName"
					children={(f) => <f.TextField label="Display Name" />}
				/>
				<group.AppField
					name="UrlStub"
					children={(f) => <f.TextField label="Url Stub" />}
				/>
				<group.AppField
					name="OldCategoryId"
					children={(f) => (
						<f.TextField
							label="Old Id"
							disabled
						/>
					)}
				/>
			</FieldGroup>
		);
	},
});

export const MenuFieldGroup = withFieldGroup({
	defaultValues: create(CMSPublicMenuRecordSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name="AudioMenuLinkName"
					children={(f) => <f.TextField label="Audio Link Name" />}
				/>
				<group.AppField
					name="PictureMenuLinkName"
					children={(f) => <f.TextField label="Picture Link Name" />}
				/>
				<group.AppField
					name="WrittenMenuLinkName"
					children={(f) => <f.TextField label="Written Link Name" />}
				/>
				<group.AppField
					name="VideoMenuLinkName"
					children={(f) => <f.TextField label="Video Link Name" />}
				/>
			</FieldGroup>
		);
	},
});

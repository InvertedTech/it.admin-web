import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	CategoryRecordSchema,
	ChannelRecordSchema,
	CMSPublicMenuRecordSchema,
} from '@inverted-tech/fragments/protos/Settings/SettingsRecord_pb';

export const ChannelFieldGroup = withFieldGroup({
	defaultValues: create(ChannelRecordSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='ChannelId'
					children={(f) => <f.TextField label='Id' disabled />}
				/>
				<group.AppField
					name='ParentChannelId'
					children={(f) => <f.TextField label='Parent Id' disabled />}
				/>
				<group.AppField
					name='DisplayName'
					children={(f) => <f.TextField label='Display Name' />}
				/>
				<group.AppField
					name='UrlStub'
					children={(f) => <f.TextField label='Url Stub' />}
				/>
				<group.AppField
					name='ImageAssetId'
					children={(f) => <f.ImagePickerField label='Image' />}
				/>
				<group.AppField
					name='YoutubeUrl'
					children={(f) => <f.TextField label='Youtube URL' />}
				/>
				<group.AppField
					name='RumbleUrl'
					children={(f) => <f.TextField label='Rumble URL' />}
				/>
				<group.AppField
					name='OldChannelId'
					children={(f) => <f.TextField label='Old Id' disabled />}
				/>
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
					name='CategoryId'
					children={(f) => <f.TextField label='Id' disabled />}
				/>
				<group.AppField
					name='ParentCategoryId'
					children={(f) => <f.TextField label='Parent Id' disabled />}
				/>
				<group.AppField
					name='DisplayName'
					children={(f) => <f.TextField label='Display Name' />}
				/>
				<group.AppField
					name='UrlStub'
					children={(f) => <f.TextField label='Url Stub' />}
				/>
				<group.AppField
					name='OldCategoryId'
					children={(f) => <f.TextField label='Old Id' disabled />}
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
					name='AudioMenuLinkName'
					children={(f) => <f.TextField label='Audio Link Name' />}
				/>
				<group.AppField
					name='PictureMenuLinkName'
					children={(f) => <f.TextField label='Picture Link Name' />}
				/>
				<group.AppField
					name='WrittenMenuLinkName'
					children={(f) => <f.TextField label='Written Link Name' />}
				/>
				<group.AppField
					name='VideoMenuLinkName'
					children={(f) => <f.TextField label='Video Link Name' />}
				/>
			</FieldGroup>
		);
	},
});

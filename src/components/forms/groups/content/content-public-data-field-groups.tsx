'use client';

import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { useStore } from '@tanstack/react-form';

import { PictureContentPublicDataSchema } from '@inverted-tech/fragments/Content';
import { AudioContentPublicDataSchema } from '@inverted-tech/fragments/Content';
import { VideoContentPublicDataSchema } from '@inverted-tech/fragments/Content';
import { WrittenContentPublicDataSchema } from '@inverted-tech/fragments/Content';

const WrittenContentPublicDataFields = withFieldGroup({
	props: { title: 'Written' },
	defaultValues: create(WrittenContentPublicDataSchema),
	render: function Render({ group, title }) {
		return (
			<>
				<group.AppField name="HtmlBody">
					{(field) => <field.RichBodyField label={'Body'} />}
				</group.AppField>
			</>
		);
	},
});

const VideoContentPublicDataFields = withFieldGroup({
	props: { title: 'Video' },
	defaultValues: create(VideoContentPublicDataSchema),
	render: function Render({ group, title }) {
		return (
			<>
				<group.AppField name="RumbleVideoId">
					{(field) => <field.RumbleLinkField label={'Rumble Url'} />}
				</group.AppField>
				<group.AppField name="YoutubeVideoId">
					{(field) => <field.YoutubeLinkField label={'Youtube Url'} />}
				</group.AppField>
				<group.AppField name="HtmlBody">
					{(field) => <field.RichBodyField label={'Body'} />}
				</group.AppField>
			</>
		);
	},
});

const AudioContentPublicDataFields = withFieldGroup({
	props: { title: 'Audio' },
	defaultValues: create(AudioContentPublicDataSchema),
	render: function Render({ group, title }) {
		return (
			<>
				<group.AppField name="HtmlBody">
					{(field) => <field.RichBodyField label={'Body'} />}
				</group.AppField>
			</>
		);
	},
});

const PictureContentPublicDataFields = withFieldGroup({
	props: { title: 'Picture' },
	defaultValues: create(PictureContentPublicDataSchema),
	render: function Render({ group, title }) {
		return (
			<>
				<group.AppField name="HtmlBody">
					{(field) => <field.RichBodyField label={'Body'} />}
				</group.AppField>
			</>
		);
	},
});

export default {
	WrittenContentPublicDataFields,
	VideoContentPublicDataFields,
	AudioContentPublicDataFields,
	PictureContentPublicDataFields,
};

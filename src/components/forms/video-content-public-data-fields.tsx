'use client';

import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { useStore } from '@tanstack/react-form';
import { VideoContentPublicDataSchema } from '@inverted-tech/fragments/Content';

// A reusable field group for video content public data
const VideoContentPublicDataFields = withFieldGroup({
  props: { title: 'Video' },
	defaultValues: create(VideoContentPublicDataSchema),
	render: function Render({ group, title }) {
    return (
      <>
        <h2>{title}</h2>
        <group.AppField name='RumbleVideoId'>
          {(field) => <field.TextField label={'Rumble Id'} />}
        </group.AppField>
        <group.AppField name='YoutubeVideoId'>
          {(field) => <field.TextField label={'Youtube Id'} />}
        </group.AppField>
        <group.AppField name='HtmlBody'>
          {(field) => <field.TextAreaField label={'Body'} />}
        </group.AppField>
      </>
    );
  },
});

export default VideoContentPublicDataFields;

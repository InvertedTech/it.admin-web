'use client';

import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { useStore } from '@tanstack/react-form';
import { PictureContentPublicDataSchema } from '@inverted-tech/fragments/Content';

const PictureContentPublicDataFields = withFieldGroup({
  props: { title: 'Picture' },
	defaultValues: create(PictureContentPublicDataSchema),
	render: function Render({ group, title }) {
    return (
      <>
        <h2>{title}</h2>
        <group.AppField name='HtmlBody'>
          {(field) => <field.TextAreaField label={'Body'} />}
        </group.AppField>
      </>
    );
  },
});

export default PictureContentPublicDataFields;

'use client';

import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import { useStore } from '@tanstack/react-form';
import { WrittenContentPublicDataSchema } from '@inverted-tech/fragments/Content';

// A reusable field group for written content public data
const WrittenContentPublicDataFields = withFieldGroup({
  props: { title: 'Written' },
	defaultValues: create(WrittenContentPublicDataSchema),
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

export default WrittenContentPublicDataFields;

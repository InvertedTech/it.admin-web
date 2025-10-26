'use client';

import React from 'react';
import { withFieldGroup } from '@/hooks/use-proto-app-form';
import { FieldGroup } from '@/components/ui/field';
import { AnnounceContentRequestSchema } from '@inverted-tech/fragments/protos/Content/Content_pb';
import { create } from '@bufbuild/protobuf';

export const AnnounceContentFieldGroup = withFieldGroup({
	props: { title: '' },
	defaultValues: create(AnnounceContentRequestSchema),
	render: function Render({ group, title }) {
		return (
			<FieldGroup>
				<group.AppField
					name="AnnounceOnUTC"
					children={(f) => <f.DateTimeField label="Announce On" />}
				/>
			</FieldGroup>
		);
	},
});

export default {
	AnnounceContentFieldGroup,
};

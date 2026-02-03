import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	PhysicalEventVenueSchema,
	VirtualEventVenueSchema,
} from '@inverted-tech/fragments/protos/Authorization/Events/EventRecord_pb';

export const PhysicalVenueFields = withFieldGroup({
	defaultValues: create(PhysicalEventVenueSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name="Name"
					children={(f) => <f.TextField label="Name" />}
				/>
				<group.AppField
					name="Address"
					children={(f) => <f.TextField label="Address" />}
				/>
				<group.AppField
					name="City"
					children={(f) => <f.TextField label="City" />}
				/>
				<group.AppField
					name="StateOrProvince"
					children={(f) => <f.TextField label="StateOrProvince" />}
				/>
				<group.AppField
					name="PostalCode"
					children={(f) => <f.TextField label="PostalCode" />}
				/>
				<group.AppField
					name="Country"
					children={(f) => <f.TextField label="Country" />}
				/>
				<group.AppField
					name="PhoneNumber"
					children={(f) => <f.TextField label="PhoneNumber" />}
				/>
				<group.AppField
					name="EmailAddress"
					children={(f) => <f.TextField label="EmailAddress" />}
				/>
			</FieldGroup>
		);
	},
});

export const VirtualVenueFields = withFieldGroup({
	defaultValues: create(VirtualEventVenueSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name="Name"
					children={(f) => <f.TextField label="Name" />}
				/>
				<group.AppField
					name="Url"
					children={(f) => <f.TextField label="Url" />}
				/>
				<group.AppField
					name="AccessInstructions"
					children={(f) => <f.TextAreaField label="AccessInstructions" />}
				/>
				<group.AppField
					name="ContactEmailAddress"
					children={(f) => <f.TextField label="ContactEmailAddress" />}
				/>
			</FieldGroup>
		);
	},
});

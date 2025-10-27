import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { SubscriptionTierSchema } from '@inverted-tech/fragments/Authorization/index';

export const SubscriptionTierFieldGroup = withFieldGroup({
	defaultValues: create(SubscriptionTierSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name="Name"
					children={(f) => <f.TextField label="Name" />}
				/>
				<group.AppField
					name="Description"
					children={(f) => <f.TextField label="Description" />}
				/>
				<group.AppField
					name="Color"
					children={(f) => <f.ColorField label="Color" />}
				/>
				<group.AppField
					name="AmountCents"
					children={(f) => <f.MoneyCentsField label="Amount (Cents)" />}
				/>
			</FieldGroup>
		);
	},
});

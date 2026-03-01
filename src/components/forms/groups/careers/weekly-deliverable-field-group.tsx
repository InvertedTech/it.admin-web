import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { WeeklyDeliverableSchema } from '@inverted-tech/fragments/Careers';

export const WeeklyDeliverableFieldGroup = withFieldGroup({
	defaultValues: create(WeeklyDeliverableSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='DeliverableName'
					children={(f) => <f.TextField />}
				/>
				<group.AppField
					name='DeliverableDetails'
					children={(f) => <f.TextField />}
				/>
			</FieldGroup>
		);
	},
});

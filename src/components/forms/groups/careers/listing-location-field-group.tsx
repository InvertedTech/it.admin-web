import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { ListingLocationSchema } from '@inverted-tech/fragments/Careers';
export const ListingLocationFieldGroup = withFieldGroup({
	defaultValues: create(ListingLocationSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='Area'
					children={(f) => <f.TextField label='Area' />}
				/>
				<group.AppField
					name='RelocationRequired'
					children={(f) => (
						<f.SwitchField label='Relocation Required?' />
					)}
				/>
				<group.AppField
					name='EmploymentType'
					children={(f) => (
						<f.JobTypeSelect label='Employment Type' />
					)}
				/>
			</FieldGroup>
		);
	},
});

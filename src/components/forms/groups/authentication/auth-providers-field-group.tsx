import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { MicrosoftAuthProviderSchema } from '@inverted-tech/fragments/Authentication';

export const AuthProvidersFieldGroup = withFieldGroup({
	defaultValues: create(MicrosoftAuthProviderSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				<group.AppField
					name='UserId'
					children={(f) => (
						<f.TextField label='Microsoft User ID' />
					)}
				/>
			</FieldGroup>
		);
	},
});

import { FieldGroup } from '@/components/ui/field';
import { withFieldGroup } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import { TicketClassRecordSchema } from '@inverted-tech/fragments/protos/Authorization/Events/TicketClassRecord_pb';

export const TicketClassFieldGroup = withFieldGroup({
	defaultValues: create(TicketClassRecordSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				{/* <group.AppField
					name='TicketClassId'
					children={(f) => <f.TextField label='Id' disabled />}
				/> */}
				<group.AppField
					name='Name'
					children={(f) => <f.TextField label='Name' />}
				/>
				<group.AppField
					name='CountTowardEventMax'
					children={(f) => (
						<f.SwitchField label='Count Towards Event Max' />
					)}
				/>
				<group.AppField
					name='AmountAvailable'
					children={(f) => <f.TextField label='Amount Availible' />}
				/>
				<group.AppField
					name='IsTransferrable'
					children={(f) => <f.SwitchField label='Is Transferrable' />}
				/>
				<group.AppField
					name='MaxTicketsPerUser'
					children={(f) => (
						<f.TextField label='Maximum Allowed Tickets Per User' />
					)}
				/>
				<group.AppField
					name='PricePerTicketCents'
					children={(f) => (
						<f.MoneyCentsField label='Price Per Ticket (In Cents)' />
					)}
				/>
			</FieldGroup>
		);
	},
});

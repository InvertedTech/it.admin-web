import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { create } from '@bufbuild/protobuf';
import {
	AdminCreateEventRequestSchema,
	CreateEventDataSchema,
} from '@inverted-tech/fragments/Authorization/Events/AdminEventInterface_pb';

// TODO: Add Ticket Class Fields and Event Venue Fields
export function CreateEventForm() {
	const form = useProtoAppForm({
		schema: CreateEventDataSchema,
		defaultInit: create(CreateEventDataSchema),
		onSubmitAsync: async ({ value }) => {
			const req = create(AdminCreateEventRequestSchema, {
				Data: value,
			});
			// TODO: Send this request to the API/server action and handle the response.
			console.log(req);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			id='create-event'
		>
			<form.AppForm>
				<form.AppField
					name='Title'
					children={(f) => <f.TextField label='Title' />}
				/>
				<form.AppField
					name='Description'
					children={(f) => <f.TextField label='Description' />}
				/>

				<form.AppField name='Tags'>
					{(f) => <f.MultiSelectField label={'Tags'} />}
				</form.AppField>
				<form.AppField
					name='StartTimeUTC'
					children={(f) => <f.DateTimeField label='Start Time' />}
				/>

				<form.AppField
					name='EndTimeUTC'
					children={(f) => <f.DateTimeField label='End Time' />}
				/>
				<form.AppField
					name='MaxTickets'
					children={(f) => <f.TextField label='MaxTickets' />}
				/>
			</form.AppForm>
		</form>
	);
}

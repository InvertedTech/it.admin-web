'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	CreateCareerRequestSchema,
	ListingLocationSchema,
} from '@inverted-tech/fragments/Careers';
import { ListingLocationFieldGroup } from './groups/careers/listing-location-field-group';
import { createCareer } from '@/app/actions/careers';

import { violationsToTanStackErrors } from '@/hooks/use-proto-validation';
import { useRouter } from 'next/navigation';
import { WeeklyDeliverablesList } from './groups/careers/weekly-deliverables-list';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function CreateCareerForm() {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CreateCareerRequestSchema,
		defaultValues: create(CreateCareerRequestSchema, {
			Location: create(ListingLocationSchema),
		}),
		mapViolations: (violations) => {
			const result = violationsToTanStackErrors(violations);
			const fields: Record<string, string | string[]> = {
				...result.fields,
			};
			// Proto validator flags the entire Location message; remap to Location.Area
			const locErr = fields['Location'] ?? fields['location'];
			if (locErr) {
				fields['Location.Area'] = locErr as string | string[];
				delete fields['Location'];
				delete fields['location'];
			}
			return { form: result.form, fields };
		},
		onValidSubmit: async ({ value }) => {
			const res = await createCareer(value);
			const reason = res.Error?.Reason as unknown;
			// if (reason && reason !== 'ERROR_REASON_NO_ERROR') {
			// 	return { form: res.Error!.Message || 'Failed to create career listing' };
			// }
			router.push(`/careers`);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<div className='flex flex-col gap-6'>
					<Card>
						<CardHeader>
							<CardTitle>Listing Details</CardTitle>
						</CardHeader>
						<CardContent className='flex flex-col gap-4'>
							<form.AppField
								name='Title'
								children={(f) => <f.TextField />}
							/>
							<form.AppField
								name='Company'
								children={(f) => <f.TextField />}
							/>
							<form.AppField
								name='ReportsTo'
								children={(f) => (
									<f.TextField label='Reports To' />
								)}
							/>
							<form.AppField
								name='Contact'
								children={(f) => <f.TextField />}
							/>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Location & Employment</CardTitle>
						</CardHeader>
						<CardContent>
							<ListingLocationFieldGroup
								form={form}
								fields={
									{
										Area: 'Location.Area',
										RelocationRequired:
											'Location.RelocationRequired',
										EmploymentType:
											'Location.EmploymentType',
									} as never
								}
							/>
						</CardContent>
					</Card>
				</div>
				<Card>
					<CardHeader>
						<CardTitle>About the Role</CardTitle>
					</CardHeader>
					<CardContent>
						<form.AppField
							name='About'
							children={(f) => <f.RichTextField />}
						/>

						<form.AppField
							name='RoleOverview'
							children={(f) => (
								<f.RichTextField label='Role Overview' />
							)}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Responsibilities</CardTitle>
					</CardHeader>
					<CardContent>
						<form.AppField
							name='Responsibilities'
							children={(f) => (
								<f.TextListField label='Responsibilities' />
							)}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Qualifications</CardTitle>
					</CardHeader>
					<CardContent>
						<form.AppField
							name='Qualifications'
							children={(f) => (
								<f.TextListField label='Qualifications' />
							)}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Weekly Deliverables</CardTitle>
					</CardHeader>
					<CardContent>
						<WeeklyDeliverablesList form={form} />
					</CardContent>
				</Card>
				<div className='flex flex-col gap-2'>
					<form.SubmitErrors />
					<form.CreateButton label='Create' />
				</div>
			</form.AppForm>
		</form>
	);
}

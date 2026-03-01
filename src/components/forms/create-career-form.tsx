'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import { CreateCareerRequestSchema } from '@inverted-tech/fragments/Careers';
import { FormCard } from './form-card';
import { ListingLocationFieldGroup } from './groups/careers/listing-location-field-group';
import { createCareer } from '@/app/actions/careers';
import { APIErrorReason } from '@inverted-tech/fragments';
import { useRouter } from 'next/navigation';
import { WeeklyDeliverablesList } from './groups/careers/weekly-deliverables-list';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function CreateCareerForm() {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CreateCareerRequestSchema,
		defaultValues: create(CreateCareerRequestSchema),
		onSubmitAsync: async ({ value }) => {
			const res = await createCareer(value);
			if (
				res.Error &&
				res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
			) {
				console.log(res);
				return;
			}

			router.push(`/careers`);
			return;
		},
	});

	return (
		<form onSubmit={form.handleSubmit}>
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
										Area: 'Area',
										RelocationRequired:
											'RelocationRequired',
										EmploymentType: 'EmploymentType',
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
								<f.ResponsibilitiesInputField label='' />
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

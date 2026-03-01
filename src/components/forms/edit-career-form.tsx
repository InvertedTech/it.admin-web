'use client';

import { create } from '@bufbuild/protobuf';
import { useProtoAppForm } from '@/hooks/use-proto-app-form';
import {
	UpdateCareerRequestSchema,
	CareerRecordSchema,
	CareerRecord,
} from '@inverted-tech/fragments/Careers';
import { ListingLocationFieldGroup } from './groups/careers/listing-location-field-group';
import { updateCareer } from '@/app/actions/careers';
import { APIErrorReason } from '@inverted-tech/fragments';
import { useRouter } from 'next/navigation';
import { WeeklyDeliverablesList } from './groups/careers/weekly-deliverables-list';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export function UpdateCareerForm({ career }: { career: CareerRecord }) {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CareerRecordSchema,
		defaultValues: create(CareerRecordSchema, career),
		onSubmitAsync: async ({ value }) => {
			const req = create(UpdateCareerRequestSchema, {
				CareerId: career.CareerId,
				Career: value,
			});
			const res = await updateCareer(req);
			if (
				res.Error &&
				res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
			) {
				return {
					form:
						res.Error.Message || 'Failed to update career listing',
				};
			}
			router.push(`/careers/${res.Record?.CareerId}`);
			return;
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
				<form.AppField
					name='CareerId'
					children={(f) => <f.HiddenField />}
				/>

				<div className='flex flex-col gap-6'>
					{/* Listing Details */}
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

					{/* Location & Employment */}
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

					{/* About the Role */}
					<Card>
						<CardHeader>
							<CardTitle>About the Role</CardTitle>
						</CardHeader>
						<CardContent className='flex flex-col gap-4'>
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

					{/* Responsibilities */}
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

					{/* Weekly Deliverables */}
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
						<form.CreateButton label='Update' />
					</div>
				</div>
			</form.AppForm>
		</form>
	);
}

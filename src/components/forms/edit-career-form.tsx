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
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UpdateCareerForm({ career }: { career: CareerRecord }) {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CareerRecordSchema,
		defaultValues: create(CareerRecordSchema, career),
		normalizeBeforeValidate: (value) => {
			// Strip server-managed timestamps — they're undefined on active records
			// and cause ForeignFieldError when the proto validator inspects them.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { CreatedOnUTC, ModifiedOnUTC, DeletedOnUTC, ...rest } =
				value as any;
			return rest as typeof value;
		},
		onSubmitAsync: async ({ value }) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { CreatedOnUTC, ModifiedOnUTC, DeletedOnUTC, ...careerFields } =
				value as any;
			const req = create(UpdateCareerRequestSchema, {
				CareerId: career.CareerId,
				Career: careerFields,
			});
			const res = await updateCareer(req);
			const reason = res.Error?.Reason as unknown;
			if (reason && reason !== 'ERROR_REASON_NO_ERROR') {
				return {
					form:
						res.Error!.Message || 'Failed to update career listing',
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
								name='Department'
								children={(f) => <f.TextField label='Department' />}
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

					{/* Listing Body */}
					<Card>
						<CardHeader>
							<CardTitle>Listing Body</CardTitle>
						</CardHeader>
						<CardContent>
							<form.AppField
								name='BodyMarkdown'
								children={(f) => (
									<f.MarkdownField
										label='Body'
										description='Markdown. Use ## About, ## Role Overview, ## Responsibilities, and ## Qualifications sections.'
									/>
								)}
							/>
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

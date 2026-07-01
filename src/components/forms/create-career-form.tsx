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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const BODY_MARKDOWN_TEMPLATE = `## About


## Role Overview


## Responsibilities

-

## Qualifications

-
`;

export function CreateCareerForm() {
	const router = useRouter();
	const form = useProtoAppForm({
		schema: CreateCareerRequestSchema,
		defaultValues: create(CreateCareerRequestSchema, {
			Location: create(ListingLocationSchema),
			BodyMarkdown: BODY_MARKDOWN_TEMPLATE,
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
								name='Department'
								children={(f) => <f.TextField label='Department' />}
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
						<form.CreateButton label='Create' />
					</div>
				</div>
			</form.AppForm>
		</form>
	);
}

'use server';

import { getCareer } from '@/app/actions/careers';
import { CareerHeading } from '@/components/careers/career-headting';
import { UpdateCareerForm } from '@/components/forms/edit-career-form';
import { create } from '@bufbuild/protobuf';
import { APIErrorReason } from '@inverted-tech/fragments';
import { GetCareerRequestSchema } from '@inverted-tech/fragments/Careers';
import { notFound } from 'next/navigation';

type Props = {
	params: Promise<{
		careerId: string;
	}>;
};

export default async function CareerPage(props: Props) {
	const { careerId } = await await props.params;
	const career = await getCareer(
		create(GetCareerRequestSchema, {
			CareerId: careerId,
		}),
	);

	if (
		!career.Career ||
		career.Error?.Reason === APIErrorReason.ERROR_REASON_NOT_FOUND
	) {
		return notFound();
	}

	return (
		<div className='container mx-auto'>
			<CareerHeading
				id={career.Career.CareerId}
				title={career.Career.Title}
				jobType={'Full-Time'}
				reportsTo={career.Career.ReportsTo}
				relocationRequired={career.Career.Location?.RelocationRequired!}
				location={career.Career.Location?.Area!}
			/>
			<UpdateCareerForm career={career.Career} />
		</div>
	);
}

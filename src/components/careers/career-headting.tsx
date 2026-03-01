'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Trash } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { useMemo } from 'react';
import { deleteCareer } from '@/app/actions/careers';
import { create } from '@bufbuild/protobuf';
import { APIErrorReason } from '@inverted-tech/fragments';
import { useRouter } from 'next/navigation';
import { DeleteCareerRequestSchema } from '@inverted-tech/fragments/Careers';
export function CareerHeading({
	id,
	title,
	jobType,
	reportsTo,
	relocationRequired,
	location,
}: {
	id: string;
	title: string;
	jobType: 'Full-Time' | 'Hybrid' | 'Remote' | 'Part-Time';
	reportsTo: string;
	relocationRequired: boolean;
	location: string;
}) {
	const router = useRouter();
	const onClickDelete = async () => {
		const res = await deleteCareer(
			create(DeleteCareerRequestSchema, {
				CareerId: id,
			}),
		);

		if (
			res.Error &&
			res.Error.Reason !== APIErrorReason.ERROR_REASON_NO_ERROR
		) {
			console.log('borked');
		}

		router.push('/careers');
	};
	return (
		<div className='font-body flex flex-col gap-3 py-2'>
			<Link
				href='/careers'
				className='flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
			>
				<ArrowLeft className='size-3.5' />
				Back to all jobs
			</Link>

			<div className='flex flex-col gap-1.5'>
				<h1 className='text-3xl font-bold'>{title}</h1>
				<div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
					<span className='flex items-center gap-1.5'>
						<MapPin className='size-3.5' />
						{location}
					</span>
					<Badge variant='outline'>{jobType}</Badge>
					{relocationRequired && (
						<Badge className='text-xs'>Relocation Required</Badge>
					)}
					<Dialog>
						<DialogTrigger>
							<Button asChild variant={'destructive'}>
								<div>
									<Trash className='inline-block' /> Delete
								</div>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Delete Listing</DialogTitle>
							<p>Are you sure you want to delete this listing?</p>
							<DialogFooter>
								<DialogClose>
									<Button variant={'outline'}>Close</Button>
								</DialogClose>
								<Button
									asChild
									variant={'destructive'}
									onClick={() => {
										onClickDelete();
									}}
								>
									<div>
										<Trash className='inline-block' />{' '}
										Delete
									</div>
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}

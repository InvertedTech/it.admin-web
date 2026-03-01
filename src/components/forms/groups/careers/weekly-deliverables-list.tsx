'use client';

import { useState } from 'react';
import { create } from '@bufbuild/protobuf';
import {
	WeeklyDeliverableSchema,
	WeeklyDeliverable,
} from '@inverted-tech/fragments/Careers';
import { useAppForm } from '@/hooks/app-form';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WeeklyDeliverableFieldGroup } from './weekly-deliverable-field-group';
import { Trash2 } from 'lucide-react';
type Deliverable = { DeliverableName: string; DeliverableDetails: string };

type AddDeliverableDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (deliverable: WeeklyDeliverable) => void;
};

function AddDeliverableDialog({
	open,
	onOpenChange,
	onAdd,
}: AddDeliverableDialogProps) {
	const dialogForm = useAppForm({
		defaultValues: create(WeeklyDeliverableSchema),
		onSubmit: ({ value }) => {
			onAdd(value);
			onOpenChange(false);
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) dialogForm.reset();
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Weekly Deliverable</DialogTitle>
				</DialogHeader>
				<dialogForm.AppForm>
					<WeeklyDeliverableFieldGroup
						form={dialogForm}
						fields={
							{
								DeliverableName: 'DeliverableName',
								DeliverableDetails: 'DeliverableDetails',
							} as never
						}
					/>
					<DialogFooter className='mt-4'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type='button'
							onClick={() => dialogForm.handleSubmit()}
						>
							Add
						</Button>
					</DialogFooter>
				</dialogForm.AppForm>
			</DialogContent>
		</Dialog>
	);
}

type Props = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: any;
};

export function WeeklyDeliverablesList({ form }: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);

	const add = (deliverable: WeeklyDeliverable) => {
		const current = (form.state.values?.WeeklyDeliverables ??
			[]) as Deliverable[];
		form.setFieldValue('WeeklyDeliverables', [...current, deliverable]);
	};

	const remove = (i: number) => {
		const current = (form.state.values?.WeeklyDeliverables ??
			[]) as Deliverable[];
		form.setFieldValue(
			'WeeklyDeliverables',
			current.filter((_, idx) => idx !== i),
		);
	};

	return (
		<div>
			<div className='mb-3 flex justify-end'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setDialogOpen(true)}
				>
					Add
				</Button>
			</div>

			<form.Subscribe
				selector={(s: any) =>
					(s?.values?.WeeklyDeliverables ?? []) as WeeklyDeliverable[]
				}
			>
				{(deliverables: Deliverable[]) =>
					deliverables.length === 0 ? (
						<div className='text-sm text-muted-foreground border rounded p-3'>
							No deliverables added yet.
						</div>
					) : (
						deliverables.map((d, i) => (
							<div
								key={i}
								className='mb-3 flex items-start justify-between rounded border p-3'
							>
								<div className='flex flex-col gap-0.5'>
									<span className='text-sm font-medium'>
										{d.DeliverableName}
									</span>
									<span className='text-muted-foreground text-sm'>
										{d.DeliverableDetails}
									</span>
								</div>
								<Button
									className='text-muted-foreground hover:text-destructive'
									type='button'
									variant='ghost'
									size='icon'
									onClick={() => remove(i)}
								>
									<Trash2 className='size-4' />
								</Button>
							</div>
						))
					)
				}
			</form.Subscribe>

			<AddDeliverableDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onAdd={add}
			/>
		</div>
	);
}

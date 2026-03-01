'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useFormContext } from '@/hooks/form-context';

export function CareersFiltersButton() {
	const form = useFormContext();
	const AppForm = form as any;
	const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);

	return (
		<>
			<Button
				type='button'
				variant='outline'
				onClick={() => setFilterDialogOpen(true)}
			>
				Filters
			</Button>

			<Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
				<DialogContent className='max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Career Filters</DialogTitle>
					</DialogHeader>
					<div className='space-y-8 py-4'>
						<div className='grid gap-6 md:grid-cols-2'>
							<AppForm.AppField name='PageSize'>
								{(f: any) => (
									<f.PageSizeField label='Page Size' value={25} />
								)}
							</AppForm.AppField>

							<AppForm.AppField name='IncludeDeleted'>
								{(f: any) => (
									<f.SwitchField label='Include Deleted' />
								)}
							</AppForm.AppField>
						</div>

						<div className='flex items-center justify-end gap-2 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => {
									AppForm.reset?.();
									AppForm.setFieldValue?.('PageOffset', 0);
								}}
							>
								Reset
							</Button>
							<Button
								type='button'
								onClick={() => {
									AppForm.setFieldValue?.('PageOffset', 0);
									AppForm.handleSubmit();
									setFilterDialogOpen(false);
								}}
							>
								Save Changes
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';

export type TierFactory<T> = () => T;

type TierListProps = {
	form: any; // useProtoAppForm instance
	basePath: string; // e.g. "Data.Tiers"
	makeTier: TierFactory<any>;
};

export function TierList({ form, basePath, makeTier }: TierListProps) {
	const add = () => {
		const list = ((form.state.values as any)?.Data?.Tiers ?? []) as any[];
		form.setFieldValue(basePath as any, [...list, makeTier()]);
	};
	const remove = (i: number) => {
		const list = ((form.state.values as any)?.Data?.Tiers ?? []) as any[];
		form.setFieldValue(
			basePath as any,
			list.slice(0, i).concat(list.slice(i + 1))
		);
	};

	return (
		<div>
			<div className="mb-2 flex items-center justify-between">
				<FieldLabel>Manage</FieldLabel>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
				>
					Add tier
				</Button>
			</div>

			<form.Subscribe
				selector={(s: any) => (s?.values?.Data?.Tiers ?? []) as any[]}
			>
				{(tiers: any[]) =>
					tiers.length === 0 ? (
						<div className="text-sm text-muted-foreground border rounded p-3">
							No tiers added.
						</div>
					) : (
						tiers.map((_: any, i: number) => (
							<div
								key={i}
								className="mb-4 rounded border p-3"
							>
								<div className="mb-2 flex justify-end">
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => remove(i)}
									>
										Remove
									</Button>
								</div>
								<div className="grid gap-3 md:grid-cols-2">
									<form.AppField name={`${basePath}.${i}.Name` as any}>
										{(f: any) => <f.TextField label="Name" />}
									</form.AppField>
									<form.AppField name={`${basePath}.${i}.AmountCents` as any}>
										{(f: any) => <f.MoneyCentsField label="Amount (Cents)" />}
									</form.AppField>
									<form.AppField name={`${basePath}.${i}.Description` as any}>
										{(f: any) => <f.TextField label="Description" />}
									</form.AppField>
									<form.AppField name={`${basePath}.${i}.Color` as any}>
										{(f: any) => <f.ColorField label="Color" />}
									</form.AppField>
								</div>
							</div>
						))
					)
				}
			</form.Subscribe>
		</div>
	);
}

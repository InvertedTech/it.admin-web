import React from 'react';
import { FieldGroup } from '@/components/ui/field';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { withFieldGroup } from '@/hooks/app-form';
import { useFormContext } from '@/hooks/form-context';
import { create } from '@bufbuild/protobuf';
import { GetAllContentAdminRequestSchema } from '@inverted-tech/fragments/Content';

type ChannelOption = { ChannelId?: string; DisplayName?: string };
type CategoryOption = { CategoryId?: string; DisplayName?: string };

export function ContentFiltersButton() {
	const form = useFormContext();
	const AppForm = form as any;
	const [channels, setChannels] = React.useState<ChannelOption[]>([]);
	const [categories, setCategories] = React.useState<CategoryOption[]>([]);
	const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);

	React.useEffect(() => {
		let mounted = true;
		fetch('/api/cms/channels')
			.then((r) => r.json())
			.then((j) => {
				if (!mounted) return;
				const list = Array.isArray(j?.Records)
					? (j.Records as ChannelOption[])
					: [];
				setChannels(list);
			})
			.catch(() => {
				if (mounted) setChannels([]);
			});
		return () => {
			mounted = false;
		};
	}, []);

	React.useEffect(() => {
		let mounted = true;
		fetch('/api/cms/categories')
			.then((r) => r.json())
			.then((j) => {
				if (!mounted) return;
				const list = Array.isArray(j?.Records)
					? (j.Records as CategoryOption[])
					: [];
				setCategories(list);
			})
			.catch(() => {
				if (mounted) setCategories([]);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const channelOptions = React.useMemo(
		() =>
			channels.map((c) => ({
				ChannelId: String(c.ChannelId ?? ''),
				DisplayName: String(c.DisplayName ?? c.ChannelId ?? ''),
			})),
		[channels],
	);

	const categoryOptions = React.useMemo(
		() =>
			categories.map((c) => ({
				CategoryId: String(c.CategoryId ?? ''),
				DisplayName: String(c.DisplayName ?? ''),
			})),
		[categories],
	);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={() => setFilterDialogOpen(true)}
			>
				Filters
			</Button>

			{/* TODO: Experiment with shadcn Sheet component for better mobile/spacing experience */}
			<Dialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
			>
				<DialogContent className="max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Content Filters</DialogTitle>
					</DialogHeader>
					<div className="space-y-8 py-4">
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							<div className="lg:col-span-1">
								<AppForm.AppField name="PageSize">
									{(f: any) => (
										<f.PageSizeField
											label="Page Size"
											value={25}
										/>
									)}
								</AppForm.AppField>
							</div>

							<div className="lg:col-span-1">
								<AppForm.AppField name="SubscriptionSearch.MinimumLevel">
									{(f: any) => (
										<f.SubscriptionTierField
											label="Minimum Tier"
											useAmountCents
											includeMaxOption
										/>
									)}
								</AppForm.AppField>
							</div>

							<div className="lg:col-span-1">
								<AppForm.AppField name="SubscriptionSearch.MaximumLevel">
									{(f: any) => (
										<f.SubscriptionTierField
											label="Maximum Tier"
											useAmountCents
											includeMaxOption
										/>
									)}
								</AppForm.AppField>
							</div>

							<div className="space-y-3 lg:col-span-1">
								<AppForm.AppField name="Deleted">
									{(f: any) => <f.SwitchField label="Show Deleted" />}
								</AppForm.AppField>
								<AppForm.AppField name="OnlyLive">
									{(f: any) => <f.SwitchField label="Show Unpublished" />}
								</AppForm.AppField>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<AppForm.AppField name="ChannelId">
								{(f: any) => (
									<f.ChannelSelectField
										label="Channel"
										options={channelOptions}
									/>
								)}
							</AppForm.AppField>

							<AppForm.AppField name="CategoryId">
								{(f: any) => (
									<f.CategorySelectField
										label="Category"
										options={categoryOptions}
									/>
								)}
							</AppForm.AppField>

							<AppForm.AppField name="ContentType">
								{(f: any) => (
									<f.ContentTypeSelectField
										label="Content Type"
										description=""
									/>
								)}
							</AppForm.AppField>
						</div>

						<div className="flex items-center justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									AppForm.reset?.();
								}}
							>
								Reset
							</Button>
							<Button
								type="button"
								onClick={() => {
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
export const AdminContentFiltersFieldGroup = withFieldGroup({
	defaultValues: create(GetAllContentAdminRequestSchema),
	render: function Render({ group }) {
		return (
			<FieldGroup>
				{/* Hidden PageOffset Field */}
				<group.AppField name="PageOffset">
					{(f) => <f.HiddenField />}
				</group.AppField>
			</FieldGroup>
		);
	},
});

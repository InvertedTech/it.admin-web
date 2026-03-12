'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/app-form';
import { create } from '@bufbuild/protobuf';
import {
	AuthProvidersSchema,
	MicrosoftAuthProviderSchema,
	ModifyOtherUserAuthProvidersRequestSchema,
} from '@inverted-tech/fragments/Authentication/index';
import { adminEditOtherAuthProviders } from '@/app/actions/auth';
import { toast } from 'sonner';

export function EditAuthProvidersDialog({
	userId,
	microsoftUserId,
	canOpen = false,
}: {
	userId: string;
	microsoftUserId?: string;
	canOpen?: boolean;
}) {
	const [open, setOpen] = useState(false);

	if (!canOpen) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Edit Auth Providers</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit Auth Providers</DialogTitle>
					<DialogDescription>
						Link or update external authentication providers for this user.
					</DialogDescription>
				</DialogHeader>
				<EditAuthProvidersForm
					userId={userId}
					microsoftUserId={microsoftUserId}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function EditAuthProvidersForm({
	userId,
	microsoftUserId,
	onSuccess,
}: {
	userId: string;
	microsoftUserId?: string;
	onSuccess: () => void;
}) {
	const form = useAppForm({
		defaultValues: {
			UserID: userId,
			AuthProviders: create(AuthProvidersSchema, {
				Microsoft: create(MicrosoftAuthProviderSchema, {
					UserId: microsoftUserId ?? '',
				}),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				const req = create(ModifyOtherUserAuthProvidersRequestSchema, {
					UserID: value.UserID,
					AuthProviders: value.AuthProviders,
				});
				const res = await adminEditOtherAuthProviders(req);
				const reason = res.Error?.Reason as unknown;
				if (reason && reason !== 'ERROR_REASON_NO_ERROR') {
					toast('Update failed', {
						description: res.Error?.Message ?? 'Failed to update auth providers',
					});
					return;
				}
				toast('Auth providers updated');
				onSuccess();
			} catch (error) {
				console.error(error);
			}
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
					name="AuthProviders.Microsoft.UserId"
					children={(f) => (
						<f.TextField label="Microsoft User ID" />
					)}
				/>
				<form.CreateButton label="Save" />
			</form.AppForm>
		</form>
	);
}

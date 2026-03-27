'use server';
import { getAdminSettings, getOwnerSettings } from '@/app/actions/settings';
import { MerchPublicSettingsForm } from '@/components/forms/merch-public-settings-form';
import { MerchOwnerSettingsForm } from '@/components/forms/merch-owner-settings-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/rbac';
import { isAdminOrHigher, isOwner } from '@/lib/roleHelpers';
import { getSession } from '@/lib/cookies';

export default async function MerchSettingsPage() {
	await requireRole(isAdminOrHigher);
	const session = await getSession();
	const roles = session?.roles ?? [];
	const showOwner = isOwner(roles);

	const { Public } = await getAdminSettings();
	const owner = showOwner
		? await getOwnerSettings().catch(() => undefined)
		: undefined;

	const publicBase = { Data: { Shopify: Public?.Merch?.Shopify } };
	const ownerBase = { Data: { Shopify: owner?.Owner?.Merch?.Shopify } };

	return (
		<div>
			<div className='space-y-1 mb-6'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Merch Settings
				</h1>
				<p className='text-muted-foreground'>
					Manage merch provider integrations.
				</p>
			</div>
			<Tabs defaultValue='public'>
				<TabsList>
					<TabsTrigger value='public'>Public</TabsTrigger>
					{showOwner ? (
						<TabsTrigger value='owner'>Owner</TabsTrigger>
					) : null}
				</TabsList>
				<TabsContent value='public'>
					<MerchPublicSettingsForm base={publicBase} />
				</TabsContent>
				{showOwner ? (
					<TabsContent value='owner'>
						<MerchOwnerSettingsForm base={ownerBase} />
					</TabsContent>
				) : null}
			</Tabs>
		</div>
	);
}

import { CreateContentForm } from '@/components/forms/create-content-form';
import { requireRole } from '@/lib/rbac';
import { canCreateContent } from '@/lib/roleHelpers';

export default async function CreateContentPage() {
	await requireRole(canCreateContent);
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Create Content
				</h1>
				<p className="text-muted-foreground">
					Draft a new piece of content and configure how it appears.
				</p>
			</div>
			<CreateContentForm />
		</div>
	);
}

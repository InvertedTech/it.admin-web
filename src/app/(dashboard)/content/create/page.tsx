// import { CreateContentForm } from '@/components/forms/create-content-form';
import { CreateContentWizard } from '@/components/forms/create-content-wizard';
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
			{/* <CreateContentForm /> */}
			<div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
				<CreateContentWizard />
			</div>
		</div>
	);
}

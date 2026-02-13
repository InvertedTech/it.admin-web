import { EditContentForm } from '@/components/forms/edit-content-form';
import { adminGetContent } from '@/app/actions/content';
import { requireRole } from '@/lib/rbac';
import { isWriterOrHigher } from '@/lib/roleHelpers';

type Props = {
	params: Promise<{
		contentId: string;
	}>;
};

export default async function EditContentPage({ params }: Props) {
	// TODO(auth-removal): Remove role/authorization gate.
	await requireRole(isWriterOrHigher);
	const contentId = (await params).contentId;
	const res = await adminGetContent(contentId);
	const record = (res as any)?.Record;

	return (
		<div className='mx-auto w-full max-w-6xl'>
			<EditContentForm contentId={contentId} record={record} />
		</div>
	);
}

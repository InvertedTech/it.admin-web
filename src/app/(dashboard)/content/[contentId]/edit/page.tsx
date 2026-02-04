import { EditContentForm } from '@/components/forms/edit-content-form';
import { adminGetContent } from '@/app/actions/content';

type Props = {
	params: Promise<{
		contentId: string;
	}>;
};

export default async function EditContentPage({ params }: Props) {
	const contentId = (await params).contentId;
	const res = await adminGetContent(contentId);
	const record = (res as any)?.Record;

	return (
		<div className='mx-auto max-w-5xl'>
			<EditContentForm contentId={contentId} record={record} />
		</div>
	);
}

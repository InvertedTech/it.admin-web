// import { requireRole } from '@/lib/rbac';
// import { isCommentModeratorOrHigher } from '@/lib/roleHelpers';

import { redirect } from 'next/navigation';

export default async function Page() {
	return redirect('/');
	// await requireRole(isCommentModeratorOrHigher);
	// return (
	// 	<>
	// 		<h1>Comments</h1>
	// 	</>
	// );
}

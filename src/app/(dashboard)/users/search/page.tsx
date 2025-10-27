// src/app/(dashboard)/users/search/page.tsx
'use server';

import { UsersSearchView } from '@/components/admin/user-search-view';

export default async function UsersSearchPage() {
	return <UsersSearchView />;
}

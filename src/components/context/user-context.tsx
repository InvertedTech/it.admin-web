'use client';
import { createContext, useContext } from 'react';
import type { UserSession } from '@/lib/cookies';

const UserContext = createContext<UserSession | null>(null);

export function UserProvider({
	user,
	children,
}: {
	user: UserSession | null;
	children: React.ReactNode;
}) {
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
	return useContext(UserContext);
}

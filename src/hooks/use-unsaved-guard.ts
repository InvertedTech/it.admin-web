// hooks/use-unsaved-guard.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type PendingNav =
	| { kind: 'push'; href: string }
	| { kind: 'replace'; href: string }
	| { kind: 'back' }
	| null;

export function useUnsavedGuard(isDirty: boolean) {
	const router = useRouter();
	const [dialogOpen, setDialogOpen] = useState(false);
	const pendingRef = useRef<PendingNav>(null);
	const bypassRef = useRef(false);

	// Confirm or cancel
	const confirm = useCallback(() => {
		const pending = pendingRef.current;
		setDialogOpen(false);
		bypassRef.current = true;
		if (!pending) return;

		if (pending.kind === 'push') router.push(pending.href);
		else if (pending.kind === 'replace') router.replace(pending.href);
		else router.back();

		pendingRef.current = null;
		// small delay to reset the bypass after navigation settles
		setTimeout(() => (bypassRef.current = false), 0);
	}, [router]);

	const cancel = useCallback(() => {
		pendingRef.current = null;
		setDialogOpen(false);
	}, []);

	// Intercept same-origin <a> clicks
	useEffect(() => {
		if (!isDirty) return;

		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
			if (!anchor) return;
			if (anchor.target && anchor.target !== '_self') return;
			if (anchor.hasAttribute('download')) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

			const href = anchor.href;
			const sameOrigin = href?.startsWith(location.origin);
			if (!sameOrigin) return;

			e.preventDefault();
			pendingRef.current = { kind: 'push', href };
			setDialogOpen(true);
		};

		document.addEventListener('click', handler, true);
		return () => document.removeEventListener('click', handler, true);
	}, [isDirty]);

	// Intercept router.push/replace that you call manually
	const guardedPush = useCallback(
		(href: string) => {
			if (!isDirty || bypassRef.current) return router.push(href);
			pendingRef.current = { kind: 'push', href };
			setDialogOpen(true);
		},
		[isDirty, router]
	);

	const guardedReplace = useCallback(
		(href: string) => {
			if (!isDirty || bypassRef.current) return router.replace(href);
			pendingRef.current = { kind: 'replace', href };
			setDialogOpen(true);
		},
		[isDirty, router]
	);

	// Intercept Back button
	useEffect(() => {
		if (!isDirty) return;
		const onPopState = (e: PopStateEvent) => {
			if (bypassRef.current) return; // allow after confirm
			// negate the back and show dialog
			history.pushState(null, '', location.href);
			pendingRef.current = { kind: 'back' };
			setDialogOpen(true);
		};
		history.pushState(null, '', location.href);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [isDirty]);

	// Warn on tab close/refresh
	useEffect(() => {
		const beforeUnload = (e: BeforeUnloadEvent) => {
			if (!isDirty) return;
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', beforeUnload);
		return () => window.removeEventListener('beforeunload', beforeUnload);
	}, [isDirty]);

	return {
		dialogOpen,
		setDialogOpen,
		confirm,
		cancel,
		guardedPush,
		guardedReplace,
	};
}

import Link from 'next/link';

export default function UnauthorizedPage() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm space-y-4 text-center">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						Access Denied
					</h1>
					<p className="text-muted-foreground">
						Your account does not have permission to access this area.
					</p>
				</div>
				<div>
					<Link
						href="/login"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
}

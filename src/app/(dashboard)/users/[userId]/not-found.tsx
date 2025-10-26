import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Card className="w-full max-w-md text-center">
				<CardContent className="flex flex-col items-center py-12">
					<div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full mb-6">
						<Ghost className="h-8 w-8 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-semibold">User not found</h2>
					<p className="text-muted-foreground mt-2 mb-6 max-w-sm">
						The requested user ID could not be located or may have been removed.
					</p>
					<Button asChild>
						<Link href="/users">Back to Users</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

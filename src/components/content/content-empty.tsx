import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '../ui/button';
export function ContentEmpty() {
	return (
		<div className="container mx-auto py-10">
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>Content Not Found</EmptyTitle>
					<EmptyDescription>
						The requested content record could not be located.
					</EmptyDescription>
				</EmptyHeader>
				<div className="flex gap-2">
					<Button
						asChild
						variant="outline"
					>
						<a href="/content">Back to list</a>
					</Button>
				</div>
			</Empty>
		</div>
	);
}

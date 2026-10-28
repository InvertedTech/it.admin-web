export function slugify(input: string | null | undefined): string {
	return String(input ?? '')
		.toLowerCase()
		.trim()
		.replace(/[']/g, '')
		.replace(/\//g, '-')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

// Builds Public.URL the way timcast.web looks content up: videos are
// `/video/<slug>` (free) or `/members-area/<slug>` (SubscriptionLevel > 0);
// other types use `<type>/<slug>`.
export function buildContentUrl(
	title: string | null | undefined,
	contentType: string | null | undefined,
	subscriptionLevel: number | null | undefined,
): string {
	const slug = slugify(title);
	if (!slug || !contentType) return slug;
	if (contentType === 'Video') {
		return Number(subscriptionLevel ?? 0) > 0
			? `/members-area/${slug}`
			: `/video/${slug}`;
	}
	return `${contentType.toLowerCase()}/${slug}`;
}

// The URL prefix timcast.web requires for this type/level, if any.
export function expectedContentUrlPrefix(
	contentType: string | null | undefined,
	subscriptionLevel: number | null | undefined,
): string | null {
	if (contentType === 'Video') {
		return Number(subscriptionLevel ?? 0) > 0 ? '/members-area/' : '/video/';
	}
	if (contentType === 'Written') return 'written/';
	return null;
}

import { requireApiBase } from '@/lib/apiBase';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ assetId: string }> },
) {
	try {
		const { assetId } = await params;
		const apiBase = requireApiBase().replace(/\/+$/, '');
		const url = `${apiBase}/cms/asset/${encodeURIComponent(assetId)}/data`;

		const upstream = await fetch(url, {
			method: 'GET',
			cache: 'no-store',
		});

		if (!upstream.ok) {
			return new Response(null, { status: upstream.status });
		}

		const body = await upstream.arrayBuffer();
		const contentType =
			upstream.headers.get('content-type') ?? 'application/octet-stream';
		const cacheControl = upstream.headers.get('cache-control') ?? 'no-store';

		return new Response(body, {
			status: 200,
			headers: {
				'content-type': contentType,
				'cache-control': cacheControl,
			},
		});
	} catch {
		return new Response(null, { status: 500 });
	}
}

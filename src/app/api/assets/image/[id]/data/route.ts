import { NextRequest, NextResponse } from 'next/server';
import { getTokenCookie } from '@/lib/session';

const API_BASE_URL = process.env.API_BASE_URL!;

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		if (!id) return new NextResponse(null, { status: 400 });

		const token = await getTokenCookie();
		const safeId = encodeURIComponent(id);
		const candidates = [
			`${API_BASE_URL}/cms/admin/asset/image/${safeId}/data`,
			`${API_BASE_URL}/cms/asset/image/${safeId}/data`,
			`${API_BASE_URL}/cms/admin/asset/${safeId}/data`,
			`${API_BASE_URL}/cms/asset/${safeId}/data`,
		];

		let res: Response | null = null;
		for (const url of candidates) {
			const nextRes = await fetch(url, {
				method: 'GET',
				headers: token ? { Authorization: `Bearer ${token}` } : undefined,
				cache: 'no-store',
			});
			if (nextRes.ok) {
				res = nextRes;
				break;
			}
			res = nextRes;
		}

		if (!res || !res.ok) {
			return new NextResponse(null, { status: res?.status ?? 404 });
		}

		const buffer = await res.arrayBuffer();
		const contentType =
			res.headers.get('content-type') ?? 'application/octet-stream';

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'private, max-age=60',
			},
		});
	} catch {
		return new NextResponse(null, { status: 500 });
	}
}

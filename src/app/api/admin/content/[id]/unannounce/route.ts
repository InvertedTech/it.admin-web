import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { create, toJsonString } from '@bufbuild/protobuf';
import { UnannounceContentRequestSchema } from '@inverted-tech/fragments/Content';

const API_BASE = 'http://localhost:8001/api/cms/admin/content';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get('token')?.value ?? '';
    const { id } = await params;
    const url = `${API_BASE}/${id}/unannounce`;

    const msg = create(UnannounceContentRequestSchema as any, { ContentID: id } as any);
    const bodyJson = toJsonString(UnannounceContentRequestSchema as any, msg as any);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: bodyJson,
    });

    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status || 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unannounce failed' }, { status: 500 });
  }
}

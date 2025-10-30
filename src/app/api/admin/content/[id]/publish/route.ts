import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getSession } from '@/lib/session';
import { create, toJsonString } from '@bufbuild/protobuf';
import { PublishContentRequestSchema } from '@inverted-tech/fragments/Content';

const API_BASE = 'http://localhost:8001/api/cms/admin/content';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await getSession()).token ?? '';
    const { id } = await params;
    const url = `${API_BASE}/${id}/publish`;
    const now = Date.now();
    const seconds = Math.floor(now / 1000);
    const nanos = (now % 1000) * 1_000_000;
    const msg = create(PublishContentRequestSchema as any, {
      ContentID: id,
      PublishOnUTC: { seconds, nanos } as any,
    } as any);
    const bodyJson = toJsonString(PublishContentRequestSchema as any, msg as any);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: bodyJson,
    });
    const body = await res.json().catch(() => ({}));
    try {
      revalidateTag('admin-content');
      revalidatePath('/content');
      revalidatePath('/content/all');
      revalidatePath(`/content/${id}`);
    } catch {}
    return NextResponse.json(body, { status: res.status || 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Publish failed' }, { status: 500 });
  }
}

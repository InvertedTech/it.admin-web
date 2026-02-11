import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getTokenCookie } from '@/lib/session';
import { requireApiBase } from '@/lib/apiBase';
import { create, toJsonString } from '@bufbuild/protobuf';
import { DeleteContentRequestSchema } from '@inverted-tech/fragments/Content';

const API_BASE = `${requireApiBase()}/cms/admin/content`;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await getTokenCookie()) ?? '';
    const { id } = await params;
    const url = `${API_BASE}/${id}/delete`;
    const msg = create(DeleteContentRequestSchema as any, { ContentID: id } as any);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: toJsonString(DeleteContentRequestSchema as any, msg as any),
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
    return NextResponse.json({ ok: false, error: e?.message || 'Delete failed' }, { status: 500 });
  }
}

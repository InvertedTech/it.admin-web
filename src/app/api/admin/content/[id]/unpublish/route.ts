import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireApiBase } from '@/lib/apiBase';
import { create, toJsonString } from '@bufbuild/protobuf';
import { UnpublishContentRequestSchema } from '@inverted-tech/fragments/Content';

const API_BASE = `${requireApiBase()}/cms/admin/content`;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = `${API_BASE}/${id}/unpublish`;
    const msg = create(UnpublishContentRequestSchema as any, { ContentID: id } as any);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: toJsonString(UnpublishContentRequestSchema as any, msg as any),
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
    return NextResponse.json({ ok: false, error: e?.message || 'Unpublish failed' }, { status: 500 });
  }
}


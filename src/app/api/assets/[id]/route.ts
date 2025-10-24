import { NextResponse } from 'next/server';
import { getAsset } from '@/app/actions/assets';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getAsset(params.id);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({}, { status: 200 });
  }
}


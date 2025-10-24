import { NextResponse } from 'next/server';
import { searchAssets } from '@/app/actions/assets';
import { AssetType } from '@inverted-tech/fragments/Content/AssetInterface_pb';

export async function GET() {
  try {
    const res = await searchAssets({ AssetType: AssetType.AssetImage, PageSize: 60, PageOffset: 0 });
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ Records: [] }, { status: 200 });
  }
}


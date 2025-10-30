"use server";

import { NewAssetForm } from '@/components/forms/new-asset-form';

export default async function AssetUploadPage() {
  return (
    <div>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Upload Asset</h1>
        <p className="text-muted-foreground">Create a new image or audio asset.</p>
      </div>
      <NewAssetForm />
    </div>
  );
}

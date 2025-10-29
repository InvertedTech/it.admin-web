"use client";

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function UsersListControls({ includeDeleted }: { includeDeleted: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checked, setChecked] = React.useState<boolean>(includeDeleted);

  React.useEffect(() => {
    setChecked(includeDeleted);
  }, [includeDeleted]);

  function onToggle(next: boolean) {
    setChecked(next);
    const params = new URLSearchParams(searchParams?.toString());
    if (next) params.set('includeDeleted', '1');
    else params.delete('includeDeleted');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Switch id="include-deleted" checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor="include-deleted">Include deleted</Label>
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFieldContext } from '@/hooks/form-context';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type ImageRecord = {
  AssetID?: string;
  Title?: string;
  URL?: string;
  Width?: number;
  Height?: number;
  Public?: { Data?: { URL?: string; MimeType?: string; Data?: string } };
  Data?: { URL?: string; MimeType?: string; Data?: string };
};

function srcFromImageRecord(r: ImageRecord): string | null {
  const direct = r?.URL || r?.Public?.Data?.URL || r?.Data?.URL;
  if (direct) return direct;
  const base64 = r?.Public?.Data?.Data || r?.Data?.Data;
  const mime = r?.Public?.Data?.MimeType || r?.Data?.MimeType || 'image/png';
  if (base64) return `data:${mime};base64,${base64}`;
  if (r?.AssetID) return `http://localhost:8081/api/cms/asset/image/${r.AssetID}/data`;
  return null;
}

export function ImagePickerField({ label = 'Image' }: { label?: string }) {
  const field = useFieldContext<string | undefined>();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || images.length) return;
    setLoading(true);
    fetch('/api/assets/images')
      .then((r) => r.json())
      .then((j) => setImages((j?.Records as ImageRecord[]) ?? []))
      .finally(() => setLoading(false));
  }, [open, images.length]);

  const selected = useMemo(() => images.find((i) => i.AssetID === field.state.value), [images, field.state.value]);
  const directSrc = selected ? srcFromImageRecord(selected) : undefined;
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  useEffect(() => {
    // Try to resolve an inline image via admin asset if direct src is not resolvable
    setFallbackSrc(null);
    const id = field.state.value;
    if (!id || directSrc) return;
    fetch(`/api/assets/${id}`)
      .then((r) => r.json())
      .then((admin) => {
        const rec = admin?.Record ?? admin?.record ?? admin;
        const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
        let dataObj: any = null;
        if (one?.case === 'Image' || one?.case === 'image') {
          const pub = (one?.value?.Public ?? one?.value?.public ?? one?.value) as any;
          dataObj = pub?.Data ?? pub?.data ?? {};
        } else if (rec?.Image || rec?.image) {
          const imageRec = rec?.Image ?? rec?.image;
          const pub = imageRec?.Public ?? imageRec?.public ?? imageRec;
          dataObj = pub?.Data ?? pub?.data ?? {};
        }
        const base64 = dataObj?.Data ?? dataObj?.data;
        const mime = dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
        if (typeof base64 === 'string' && base64.length > 0) {
          setFallbackSrc(`data:${mime};base64,${base64}`);
        }
      })
      .catch(() => {});
  }, [field.state.value, directSrc]);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded border bg-muted">
          {directSrc || fallbackSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(directSrc ?? fallbackSrc) as string} alt={selected?.Title ?? 'Selected'} className="h-full w-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">—</div>
          )}
        </div>
        <div className="text-sm">{field.state.value ?? 'No image selected'}</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="ml-auto">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogTitle>Select Image</DialogTitle>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : (
              <div className="grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
                {images.map((img) => (
                  <ImageTile
                    key={img.AssetID ?? Math.random()}
                    img={img}
                    onSelect={(id) => {
                      field.handleChange(id);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
        {field.state.value && (
          <Button type="button" variant="ghost" onClick={() => field.handleChange('')}>
            Clear
          </Button>
        )}
      </div>
    </Field>
  );
}

function ImageTile({ img, onSelect }: { img: ImageRecord; onSelect: (id: string) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const direct = srcFromImageRecord(img);
    if (direct) {
      setSrc(direct);
      return;
    }
    if (img.AssetID) {
      fetch(`/api/assets/${img.AssetID}`)
        .then((r) => r.json())
        .then((admin) => {
          const rec = admin?.Record ?? admin?.record ?? admin;
          const one = rec?.AssetRecordOneof ?? rec?.assetRecordOneof;
          let dataObj: any = null;
          if (one?.case === 'Image' || one?.case === 'image') {
            const pub = (one?.value?.Public ?? one?.value?.public ?? one?.value) as any;
            dataObj = pub?.Data ?? pub?.data ?? {};
          } else if (rec?.Image || rec?.image) {
            const imageRec = rec?.Image ?? rec?.image;
            const pub = imageRec?.Public ?? imageRec?.public ?? imageRec;
            dataObj = pub?.Data ?? pub?.data ?? {};
          }
          const b64 = dataObj?.Data ?? dataObj?.data;
          const mime = dataObj?.MimeType ?? dataObj?.mimeType ?? 'image/png';
          if (typeof b64 === 'string' && b64.length > 0) {
            setSrc(`data:${mime};base64,${b64}`);
          } else {
            setSrc(`http://localhost:8081/api/cms/asset/image/${img.AssetID}/data`);
          }
        })
        .catch(() => setSrc(null));
    }
  }, [img]);

  return (
    <button
      type="button"
      className="focus-visible:ring-ring hover:ring-ring group relative overflow-hidden rounded border outline-none ring-2 ring-transparent"
      onClick={() => img.AssetID && onSelect(img.AssetID)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? (
        <img src={src} alt={img.Title ?? ''} className="h-28 w-full object-cover sm:h-32" />
      ) : (
        <div className="text-muted-foreground flex h-28 w-full items-center justify-center text-xs sm:h-32">
          No preview
        </div>
      )}
      <div className="bg-background/70 text-foreground absolute bottom-0 left-0 right-0 truncate px-2 py-1 text-xs">
        {img.Title ?? img.AssetID}
      </div>
    </button>
  );
}

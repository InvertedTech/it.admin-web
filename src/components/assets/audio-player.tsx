"use client";

type Props = {
  dataBase64?: string | null;
  mimeType?: string | null;
  className?: string;
};

export function AudioPlayer({ dataBase64, mimeType, className }: Props) {
  if (!dataBase64) {
    return (
      <div className={className ?? ''}>
        <div className="text-xs text-muted-foreground">No audio data</div>
      </div>
    );
  }
  const type = mimeType || 'audio/mpeg';
  const src = `data:${type};base64,${dataBase64}`;
  return (
    <audio controls preload="metadata" className={className ?? 'w-full'}>
      <source src={src} type={type} />
      Your browser does not support the audio element.
    </audio>
  );
}


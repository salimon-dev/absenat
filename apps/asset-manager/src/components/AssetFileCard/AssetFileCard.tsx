import { useEffect, useState } from 'react';
import s from './AssetFileCard.module.css';

interface Props {
  file: File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AssetFileCard({ file }: Props) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <article className={s.card}>
      <div className={s.preview}>
        {previewUrl && <img className={s.image} src={previewUrl} alt="" />}
      </div>
      <div className={s.meta}>
        <span className={s.filename} title={file.name}>{file.name}</span>
        <span className={s.size}>{formatSize(file.size)}</span>
      </div>
    </article>
  );
}

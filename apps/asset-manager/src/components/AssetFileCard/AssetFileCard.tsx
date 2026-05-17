import { useEffect, useMemo } from 'react';
import s from './AssetFileCard.module.css';

interface Props {
  file: File;
  onEdit: (filename: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AssetFileCard({ file, onEdit }: Props) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <article className={s.card}>
      <div className={s.preview}>
        <img className={s.image} src={previewUrl} alt="" />
      </div>
      <div className={s.meta}>
        <span className={s.filename} title={file.name}>{file.name}</span>
        <span className={s.size}>{formatSize(file.size)}</span>
      </div>
      <button className={s.editBtn} onClick={() => onEdit(file.name)}>
        Edit
      </button>
    </article>
  );
}

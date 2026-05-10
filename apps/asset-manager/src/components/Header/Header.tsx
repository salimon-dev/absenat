import { useRef } from 'react';
import s from './Header.module.css';

interface Props {
  onUpload: (file: File) => void;
  onExport: () => void;
  canExport: boolean;
}

export function Header({ onUpload, onExport, canExport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  }

  return (
    <header className={s.header}>
      <span className={s.logo}>
        asset<span className={s.logoAccent}> manager</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".png,image/png"
        className={s.hiddenInput}
        onChange={handleFileChange}
      />
      <div className={s.actions}>
        <button
          className={s.exportBtn}
          onClick={onExport}
          disabled={!canExport}
        >
          Export
        </button>
        <button className={s.uploadBtn} onClick={() => inputRef.current?.click()}>
          Upload Asset
        </button>
      </div>
    </header>
  );
}

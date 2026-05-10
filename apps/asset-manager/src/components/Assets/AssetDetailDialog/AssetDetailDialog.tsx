import { useEffect, useRef, useState } from 'react';
import type { AssetEntry } from '../types';
import s from './AssetDetailDialog.module.css';

interface Props {
  asset: AssetEntry;
  frame: number;
  allTags: string[];
  onClose: () => void;
  onUpdate: (id: string, tags: string[]) => void;
  onDelete: () => void;
}

export function AssetDetailDialog({
  asset,
  frame,
  allTags,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [id, setId] = useState(asset.id);
  const [tags, setTags] = useState<string[]>(asset.tags);
  const [newTag, setNewTag] = useState('');
  const newTagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleTagSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setTags(selected);
  }

  function handleAddTag() {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setNewTag('');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setNewTag('');
    newTagInputRef.current?.focus();
  }

  function handleNewTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleRemoveTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleUpdate() {
    onUpdate(id.trim(), tags);
    onClose();
  }

  const knownTags = Array.from(new Set([...allTags, ...tags])).sort();

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>Asset — Frame {frame}</span>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>
          <div className={s.preview}>
            <img src={asset.dataUrl} alt={`tile ${frame}`} className={s.previewImg} />
          </div>
          <div className={s.form}>
            <label className={s.label}>
              ID
              <input
                className={s.input}
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="asset-id"
              />
            </label>

            <label className={s.label}>
              Tags
              <select
                className={s.select}
                multiple
                value={tags}
                onChange={handleTagSelect}
                size={Math.max(3, Math.min(8, knownTags.length || 3))}
              >
                {knownTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>

            {tags.length > 0 && (
              <div className={s.chips}>
                {tags.map((tag) => (
                  <span key={tag} className={s.chip}>
                    {tag}
                    <button
                      className={s.chipRemove}
                      onClick={() => handleRemoveTag(tag)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className={s.addTagRow}>
              <input
                ref={newTagInputRef}
                className={s.input}
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleNewTagKey}
                placeholder="New tag…"
              />
              <button className={s.btnSecondary} type="button" onClick={handleAddTag}>
                Add
              </button>
            </div>
          </div>
        </div>
        <div className={s.footer}>
          <button className={s.btnDanger} onClick={onDelete}>Delete</button>
          <button className={s.btnPrimary} onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
}

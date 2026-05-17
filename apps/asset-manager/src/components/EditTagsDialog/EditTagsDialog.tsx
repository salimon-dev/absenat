import { useState, useRef } from 'react';
import type { AssetSchema } from '@absenat/specs';
import { AssetTags } from '@absenat/specs';
import s from './EditTagsDialog.module.css';

interface Props {
  asset: AssetSchema;
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

export function EditTagsDialog({ asset, onClose, onSave }: Props) {
  const [tags, setTags] = useState<string[]>([...asset.tags]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setInput('');
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.dialog} onClick={e => e.stopPropagation()}>
        <div className={s.dialogHeader}>
          <span className={s.title}>Edit Tags</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          <div className={s.field}>
            <label className={s.label}>Tags</label>
            <div className={s.inputRow}>
              {tags.map(t => (
                <span key={t} className={s.tag}>
                  {t}
                  <button className={s.removeTag} onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                ref={inputRef}
                className={s.tagInput}
                value={input}
                placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>

          <div className={s.suggestions}>
            <span className={s.suggestionsLabel}>Suggestions:</span>
            {AssetTags.map(t => (
              <button
                key={t}
                className={s.suggestion}
                disabled={tags.includes(t)}
                onClick={() => addTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.saveBtn} onClick={() => onSave(tags)}>Save</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MapModuleTypeEnum } from '@absenat/specs';
import type { MapModuleType } from '@absenat/specs';
import s from './SaveModuleDialog.module.css';

interface SaveModuleDialogProps {
  onSave: (name: string, type: MapModuleType) => void;
  onClose: () => void;
  initialName?: string;
  initialType?: MapModuleType;
}

const MODULE_TYPES = Object.values(MapModuleTypeEnum) as MapModuleType[];

export function SaveModuleDialog({ onSave, onClose, initialName = '', initialType }: SaveModuleDialogProps) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<MapModuleType>(initialType ?? MODULE_TYPES[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, type);
  }

  return (
    <div className={s.backdrop} onClick={onClose}>
      <form className={s.dialog} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className={s.header}>
          <span className={s.title}>{initialName ? 'Edit Module' : 'Save Module'}</span>
          <button type="button" className={s.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={s.body}>
          <label className={s.label}>
            Name
            <input
              className={s.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Module name…"
              autoFocus
            />
          </label>
          <label className={s.label}>
            Type
            <select
              className={s.select}
              value={type}
              onChange={(e) => setType(e.target.value as MapModuleType)}
            >
              {MODULE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={s.footer}>
          <button type="button" className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.saveBtn} disabled={!name.trim()}>{initialName ? 'Update' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import type { Entity } from '@absenat/specs';
import { folderHandleAtom } from '../../store';
import { EntityCard } from '../../components/EntityCard/EntityCard';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import s from './EntitiesPage.module.css';

async function readEntities(
  root: FileSystemDirectoryHandle,
): Promise<Entity[]> {
  try {
    const fileHandle = await root.getFileHandle('entities.json');
    const file = await fileHandle.getFile();
    return JSON.parse(await file.text()) as Entity[];
  } catch {
    return [];
  }
}

export function EntitiesPage() {
  const folderHandle = useAtomValue(folderHandleAtom)!;
  const [entities, setEntities] = useState<Entity[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    readEntities(folderHandle).then(setEntities);
  }, [folderHandle]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Entities</h1>
        <button className={s.createBtn} onClick={() => navigate('/entities/create')}>
          + Create
        </button>
      </div>

      {entities.length === 0 ? (
        <EmptyState
          icon="🧩"
          label="No entities"
          sub="Add an entities.json file to your project folder."
        />
      ) : (
        <div className={s.grid}>
          {entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      )}
    </div>
  );
}

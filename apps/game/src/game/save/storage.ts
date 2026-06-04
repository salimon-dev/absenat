import { ACTIVE_SAVE_ID } from './types';
import type { GameSaveData } from './types';

const DATABASE_NAME = 'absenat-game-saves';
const DATABASE_VERSION = 1;
const STORE_NAME = 'saves';

export async function loadSave(): Promise<GameSaveData | undefined> {
  const database = await openSaveDatabase();
  return requestToPromise<GameSaveData | undefined>(database.transaction(STORE_NAME).objectStore(STORE_NAME).get(ACTIVE_SAVE_ID));
}

export async function writeSave(save: GameSaveData): Promise<void> {
  const database = await openSaveDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(save);
  await transactionToPromise(transaction);
}

export async function deleteSave(): Promise<void> {
  const database = await openSaveDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(ACTIVE_SAVE_ID);
  await transactionToPromise(transaction);
}

export async function hasSave(): Promise<boolean> {
  return (await loadSave()) !== undefined;
}

function openSaveDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => ensureSaveStore(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open save database'));
  });
}

function ensureSaveStore(database: IDBDatabase): void {
  if (database.objectStoreNames.contains(STORE_NAME)) return;
  database.createObjectStore(STORE_NAME, { keyPath: 'id' });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to read save data'));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to write save data'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Save transaction aborted'));
  });
}

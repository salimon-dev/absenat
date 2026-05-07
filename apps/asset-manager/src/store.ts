import { atom } from 'jotai';

export enum View {
  Tiles = 'tiles',
  Objects = 'objects',
  MapEditor = 'map module editor',
}

export type ViewType = View;

export const activeViewAtom = atom<ViewType>(View.Tiles);

export const folderHandleAtom = atom<FileSystemDirectoryHandle | null>(null);
export const folderReadyAtom = atom<boolean>(false);

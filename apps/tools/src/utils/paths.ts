import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveRepoPath(path: string): string {
  return resolve(getRepoRoot(), path);
}

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
}

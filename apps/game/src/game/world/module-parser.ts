import type { MapModule } from '@absenat/specs';

export function parseModulesData(text: string): MapModule[] {
  return text.trim().split('\n').map(parseLine);
}

function parseLine(line: string): MapModule {
  const [id, name, type, tilesStr, entitiesStr] = line.split('#');
  const tiles = tilesStr.split(':');
  const entities = entitiesStr
    ? entitiesStr.split(':').filter(Boolean).map(parseEntity)
    : [];
  return { id, name, type, tiles, entities } as MapModule;
}

function parseEntity(entry: string): { id: string; col: number; row: number } {
  const [id, col, row] = entry.split(',');
  return { id, col: Number(col), row: Number(row) };
}

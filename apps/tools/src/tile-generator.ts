import { terrainPalettes } from './utils/terrain.ts';
import { tileTemplates } from './utils/tile-templates.ts';
import { createTiles } from './utils/tiles.ts';
import { createTilesSvg } from './utils/tile-sheet-svg.ts';
import { resolveRepoPath } from './utils/paths.ts';
import { writePngFromSvg } from './utils/write-png-from-svg.ts';

const outputPath = resolveRepoPath('apps/game/public/assets/tiles.png');

async function main(): Promise<void> {
  const tiles = terrainPalettes.flatMap((palette) => createTiles(palette, tileTemplates));
  await writePngFromSvg(createTilesSvg(tiles), outputPath);
  console.log(`Generated ${outputPath}`);
}

await main();

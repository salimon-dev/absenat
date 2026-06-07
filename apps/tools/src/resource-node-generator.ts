import { writeFile } from 'node:fs/promises';
import { createResourceNodeSheetSvg } from './utils/resource-node-sheet-svg.ts';
import { createResourceNodeAssetData, resourceNodeVariants } from './utils/resource-nodes.ts';
import { resolveRepoPath } from './utils/paths.ts';
import { writePngFromSvg } from './utils/write-png-from-svg.ts';

const pngPath = resolveRepoPath('apps/game/public/assets/world-resources.png');
const jsonPath = resolveRepoPath('apps/game/public/assets/world-resources.json');

async function main(): Promise<void> {
  await writePngFromSvg(createResourceNodeSheetSvg(resourceNodeVariants), pngPath);
  await writeFile(jsonPath, `${JSON.stringify(createResourceNodeAssetData(resourceNodeVariants), null, 2)}\n`);
  console.log(`Generated ${pngPath}`);
  console.log(`Generated ${jsonPath}`);
}

await main();

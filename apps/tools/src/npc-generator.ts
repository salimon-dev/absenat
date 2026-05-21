import { writeFile } from 'node:fs/promises';
import { createNpcSheetSvg } from './utils/npc-sheet-svg.ts';
import { createNpcAssetData, npcVariants } from './utils/npcs.ts';
import { resolveRepoPath } from './utils/paths.ts';
import { writePngFromSvg } from './utils/write-png-from-svg.ts';

const outputDir = 'apps/game/public/assets/npc';

async function main(): Promise<void> {
  await Promise.all(npcVariants.map(writeNpcAssets));
}

async function writeNpcAssets(variant: (typeof npcVariants)[number]): Promise<void> {
  const pngPath = resolveRepoPath(`${outputDir}/${variant.id}.png`);
  const jsonPath = resolveRepoPath(`${outputDir}/${variant.id}.json`);
  await writePngFromSvg(createNpcSheetSvg(variant), pngPath);
  await writeFile(jsonPath, `${JSON.stringify(createNpcAssetData(variant), null, 2)}\n`);
  console.log(`Generated ${pngPath}`);
  console.log(`Generated ${jsonPath}`);
}

await main();

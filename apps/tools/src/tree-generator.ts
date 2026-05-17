import { writeFile } from 'node:fs/promises';
import { createTreeSheetSvg } from './utils/tree-sheet-svg.ts';
import { createTreeAssetData, treeVariants } from './utils/trees.ts';
import { resolveRepoPath } from './utils/paths.ts';
import { writePngFromSvg } from './utils/write-png-from-svg.ts';

const pngPath = resolveRepoPath('apps/game/public/assets/trees.png');
const jsonPath = resolveRepoPath('apps/game/public/assets/trees.json');

async function main(): Promise<void> {
  await writePngFromSvg(createTreeSheetSvg(treeVariants), pngPath);
  await writeFile(jsonPath, `${JSON.stringify(createTreeAssetData(treeVariants), null, 2)}\n`);
  console.log(`Generated ${pngPath}`);
  console.log(`Generated ${jsonPath}`);
}

await main();

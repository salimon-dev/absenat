import { createToolSheetSvg } from './utils/tool-sheet-svg.ts';
import { toolVariants } from './utils/tools.ts';
import { resolveRepoPath } from './utils/paths.ts';
import { writePngFromSvg } from './utils/write-png-from-svg.ts';

const outputPath = resolveRepoPath('apps/game/public/assets/tools.png');

async function main(): Promise<void> {
  await writePngFromSvg(createToolSheetSvg(toolVariants), outputPath);
  console.log(`Generated ${outputPath}`);
}

await main();

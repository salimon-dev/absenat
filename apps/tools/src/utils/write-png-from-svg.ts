import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

export async function writePngFromSvg(svg: string, outputPath: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

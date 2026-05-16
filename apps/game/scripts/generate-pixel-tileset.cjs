const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const TILE_SIZE = 16;
const MAX_ROWS = 16;
const BIOMES = ['a', 'd', 'g', 'i', 'm', 'n', 'o', 'w'];
const OUT_DIR = path.resolve(__dirname, '../public');
const PNG_PATH = path.join(OUT_DIR, 'assets/tilemap-biomes.png');
const JSON_PATH = path.join(OUT_DIR, 'data-assets/tilemaps/tilemap-biomes.json');

const COLORS = {
  a: [216, 189, 104],
  d: [124, 83, 50],
  g: [73, 168, 73],
  i: [124, 206, 224],
  m: [82, 119, 75],
  n: [227, 235, 232],
  o: [129, 91, 48],
  w: [49, 117, 201],
};

const ACCENTS = {
  a: [235, 211, 128],
  d: [93, 61, 39],
  g: [42, 126, 54],
  i: [187, 239, 246],
  m: [55, 87, 65],
  n: [249, 252, 247],
  o: [82, 57, 35],
  w: [75, 157, 225],
};

function getModes() {
  const modes = [];
  for (const tl of BIOMES) {
    for (const tr of BIOMES) {
      for (const bl of BIOMES) {
        for (const br of BIOMES) modes.push(`${tl}${tr}${bl}${br}`);
      }
    }
  }
  return modes.sort();
}

function getSheetSize(tileCount) {
  const rows = Math.min(MAX_ROWS, tileCount);
  const cols = Math.ceil(tileCount / MAX_ROWS);
  return [cols * TILE_SIZE, rows * TILE_SIZE];
}

function getTilePosition(index) {
  return [Math.floor(index / MAX_ROWS) * TILE_SIZE, (index % MAX_ROWS) * TILE_SIZE];
}

function noise(x, y, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function mix(a, b, amount) {
  return Math.round(a + (b - a) * amount);
}

function blendColor(a, b, amount) {
  return [mix(a[0], b[0], amount), mix(a[1], b[1], amount), mix(a[2], b[2], amount)];
}

function getBiomeAt(mode, x, y, seed) {
  const vertical = x >= TILE_SIZE / 2 + Math.floor((noise(y, seed, 3) - 0.5) * 3);
  const horizontal = y >= TILE_SIZE / 2 + Math.floor((noise(x, seed, 8) - 0.5) * 3);
  if (!vertical && !horizontal) return mode[0];
  if (vertical && !horizontal) return mode[1];
  if (!vertical && horizontal) return mode[2];
  return mode[3];
}

function shadeColor(base, accent, x, y, seed) {
  const value = noise(x, y, seed);
  const checker = (x + y + seed) % 5 === 0;
  const amount = checker ? 0.28 : value > 0.82 ? 0.18 : 0;
  return blendColor(base, accent, amount);
}

function drawPixel(buffer, sheetWidth, x, y, color) {
  const offset = (y * sheetWidth + x) * 4;
  buffer[offset] = color[0];
  buffer[offset + 1] = color[1];
  buffer[offset + 2] = color[2];
  buffer[offset + 3] = 255;
}

function drawTile(buffer, sheetWidth, mode, tileX, tileY, seed) {
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const biome = getBiomeAt(mode, x, y, seed);
      const color = shadeColor(COLORS[biome], ACCENTS[biome], x, y, seed);
      drawPixel(buffer, sheetWidth, tileX + x, tileY + y, color);
    }
  }
}

async function main() {
  const modes = getModes();
  const [width, height] = getSheetSize(modes.length);
  const buffer = Buffer.alloc(width * height * 4);
  const metadata = modes.map((mode, frame) => ({ frame, mode }));

  modes.forEach((mode, index) => {
    const [tileX, tileY] = getTilePosition(index);
    drawTile(buffer, width, mode, tileX, tileY, index + 1);
  });

  fs.mkdirSync(path.dirname(PNG_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  await sharp(buffer, { raw: { width, height, channels: 4 } }).png().toFile(PNG_PATH);
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(metadata, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

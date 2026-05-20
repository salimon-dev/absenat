const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ICON_SIZE = 16;
const OUT_DIR = path.resolve(__dirname, '../../public');
const PNG_PATH = path.join(OUT_DIR, 'assets/resource.png');

const RESOURCES = [
  { name: 'wood', draw: drawWood },
  { name: 'plank', draw: drawPlank },
  { name: 'stone', draw: drawStone },
  { name: 'iron', draw: drawIron },
  { name: 'copper', draw: drawCopper },
  { name: 'gold', draw: drawGold },
  { name: 'red-mushroom', draw: drawRedMushroom },
  { name: 'blue-mushroom', draw: drawBlueMushroom },
  { name: 'green-mushroom', draw: drawGreenMushroom },
];

const COLORS = {
  transparent: [0, 0, 0, 0],
  outline: [41, 32, 29, 255],
  woodDark: [91, 55, 31, 255],
  wood: [137, 82, 45, 255],
  woodLight: [184, 119, 62, 255],
  stoneDark: [73, 78, 83, 255],
  stone: [121, 129, 132, 255],
  stoneLight: [171, 179, 178, 255],
  ironDark: [82, 92, 101, 255],
  iron: [153, 169, 178, 255],
  ironLight: [218, 228, 228, 255],
  copperDark: [116, 64, 38, 255],
  copper: [190, 102, 55, 255],
  copperLight: [238, 155, 81, 255],
  goldDark: [142, 100, 31, 255],
  gold: [225, 172, 55, 255],
  goldLight: [255, 224, 111, 255],
  stemDark: [102, 75, 58, 255],
  stem: [213, 184, 137, 255],
  red: [202, 48, 54, 255],
  blue: [57, 100, 207, 255],
  green: [58, 157, 77, 255],
  capLight: [245, 235, 194, 255],
};

async function main() {
  const width = RESOURCES.length * ICON_SIZE;
  const height = ICON_SIZE;
  const buffer = createBuffer(width, height);
  RESOURCES.forEach((resource, frame) => resource.draw(buffer, width, frame * ICON_SIZE, 0));
  await writeFiles(buffer, width, height);
}

function createBuffer(width, height) {
  const buffer = Buffer.alloc(width * height * 4);
  for (let offset = 0; offset < buffer.length; offset += 4) writeRgba(buffer, offset, COLORS.transparent);
  return buffer;
}

async function writeFiles(buffer, width, height) {
  fs.mkdirSync(path.dirname(PNG_PATH), { recursive: true });
  await sharp(buffer, { raw: { width, height, channels: 4 } }).png().toFile(PNG_PATH);
}

function drawWood(buffer, width, originX, originY) {
  drawLogBody(buffer, width, originX, originY);
  drawLogEnd(buffer, width, originX, originY);
  drawLogBarkLines(buffer, width, originX, originY);
}

function drawLogBody(buffer, width, originX, originY) {
  drawRect(buffer, width, originX, originY, 4, 5, 8, 7, COLORS.outline);
  drawRect(buffer, width, originX, originY, 5, 5, 6, 7, COLORS.wood);
  drawLine(buffer, width, originX, originY, 5, 6, 10, 6, COLORS.woodLight);
  drawLine(buffer, width, originX, originY, 5, 11, 10, 11, COLORS.woodDark);
}

function drawLogEnd(buffer, width, originX, originY) {
  drawEllipse(buffer, width, originX, originY, 1, 4, 7, 12, COLORS.outline);
  drawEllipse(buffer, width, originX, originY, 2, 5, 6, 11, COLORS.woodLight);
  drawEllipse(buffer, width, originX, originY, 3, 6, 5, 10, COLORS.wood);
  drawPixel(buffer, width, originX + 4, originY + 8, COLORS.woodDark);
}

function drawLogBarkLines(buffer, width, originX, originY) {
  drawLine(buffer, width, originX, originY, 7, 7, 12, 7, COLORS.woodDark);
  drawLine(buffer, width, originX, originY, 7, 9, 12, 9, COLORS.woodLight);
  drawPixel(buffer, width, originX + 12, originY + 6, COLORS.outline);
  drawPixel(buffer, width, originX + 12, originY + 10, COLORS.outline);
}

function drawPlank(buffer, width, originX, originY) {
  drawRect(buffer, width, originX, originY, 2, 4, 12, 9, COLORS.outline);
  drawRect(buffer, width, originX, originY, 3, 5, 10, 7, COLORS.wood);
  drawLine(buffer, width, originX, originY, 3, 7, 12, 7, COLORS.woodDark);
  drawLine(buffer, width, originX, originY, 3, 10, 12, 10, COLORS.woodLight);
  drawLine(buffer, width, originX, originY, 5, 5, 5, 11, COLORS.woodDark);
}

function drawStone(buffer, width, originX, originY) {
  drawRock(buffer, width, originX, originY, COLORS.stoneDark, COLORS.stone, COLORS.stoneLight);
}

function drawIron(buffer, width, originX, originY) {
  drawRock(buffer, width, originX, originY, COLORS.ironDark, COLORS.iron, COLORS.ironLight);
}

function drawCopper(buffer, width, originX, originY) {
  drawRock(buffer, width, originX, originY, COLORS.copperDark, COLORS.copper, COLORS.copperLight);
}

function drawGold(buffer, width, originX, originY) {
  drawRock(buffer, width, originX, originY, COLORS.goldDark, COLORS.gold, COLORS.goldLight);
}

function drawRock(buffer, width, originX, originY, dark, base, light) {
  drawEllipse(buffer, width, originX, originY, 2, 4, 13, 13, COLORS.outline);
  drawEllipse(buffer, width, originX, originY, 3, 5, 12, 12, base);
  drawRect(buffer, width, originX, originY, 4, 6, 4, 3, light);
  drawLine(buffer, width, originX, originY, 7, 11, 12, 11, dark);
  drawPixel(buffer, width, originX + 11, originY + 7, light);
}

function drawRedMushroom(buffer, width, originX, originY) {
  drawMushroom(buffer, width, originX, originY, COLORS.red);
}

function drawBlueMushroom(buffer, width, originX, originY) {
  drawMushroom(buffer, width, originX, originY, COLORS.blue);
}

function drawGreenMushroom(buffer, width, originX, originY) {
  drawMushroom(buffer, width, originX, originY, COLORS.green);
}

function drawMushroom(buffer, width, originX, originY, cap) {
  drawRect(buffer, width, originX, originY, 6, 8, 5, 6, COLORS.outline);
  drawRect(buffer, width, originX, originY, 7, 8, 3, 5, COLORS.stem);
  drawEllipse(buffer, width, originX, originY, 2, 3, 13, 10, COLORS.outline);
  drawEllipse(buffer, width, originX, originY, 3, 4, 12, 9, cap);
  drawMushroomSpots(buffer, width, originX, originY);
}

function drawMushroomSpots(buffer, width, originX, originY) {
  drawPixel(buffer, width, originX + 6, originY + 5, COLORS.capLight);
  drawPixel(buffer, width, originX + 10, originY + 6, COLORS.capLight);
  drawPixel(buffer, width, originX + 4, originY + 7, COLORS.capLight);
}

function drawRect(buffer, width, originX, originY, x, y, rectWidth, rectHeight, color) {
  for (let row = y; row < y + rectHeight; row++) {
    for (let column = x; column < x + rectWidth; column++) drawPixel(buffer, width, originX + column, originY + row, color);
  }
}

function drawLine(buffer, width, originX, originY, x1, y1, x2, y2, color) {
  for (let step = 0; step <= getLineSteps(x1, y1, x2, y2); step++) {
    drawLineStep(buffer, width, originX, originY, x1, y1, x2, y2, step, color);
  }
}

function drawLineStep(buffer, width, originX, originY, x1, y1, x2, y2, step, color) {
  const steps = getLineSteps(x1, y1, x2, y2);
  const x = Math.round(x1 + ((x2 - x1) * step) / steps);
  const y = Math.round(y1 + ((y2 - y1) * step) / steps);
  drawPixel(buffer, width, originX + x, originY + y, color);
}

function getLineSteps(x1, y1, x2, y2) {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
}

function drawEllipse(buffer, width, originX, originY, left, top, right, bottom, color) {
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const radiusX = (right - left) / 2;
  const radiusY = (bottom - top) / 2;
  fillEllipse(buffer, width, originX, originY, { centerX, centerY, radiusX, radiusY, color });
}

function fillEllipse(buffer, width, originX, originY, ellipse) {
  for (let y = Math.floor(ellipse.centerY - ellipse.radiusY); y <= Math.ceil(ellipse.centerY + ellipse.radiusY); y++) {
    for (let x = Math.floor(ellipse.centerX - ellipse.radiusX); x <= Math.ceil(ellipse.centerX + ellipse.radiusX); x++) {
      if (isInsideEllipse(x, y, ellipse)) drawPixel(buffer, width, originX + x, originY + y, ellipse.color);
    }
  }
}

function isInsideEllipse(x, y, ellipse) {
  const dx = (x - ellipse.centerX) / ellipse.radiusX;
  const dy = (y - ellipse.centerY) / ellipse.radiusY;
  return dx * dx + dy * dy <= 1;
}

function drawPixel(buffer, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width) return;
  writeRgba(buffer, (y * width + x) * 4, color);
}

function writeRgba(buffer, offset, color) {
  buffer[offset] = color[0];
  buffer[offset + 1] = color[1];
  buffer[offset + 2] = color[2];
  buffer[offset + 3] = color[3];
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

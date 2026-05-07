const fs = require('node:fs');

const TILE_TYPES = [
  'g', // grass
  'a', // sand
  'i', // ice
  'w', // water
  'd', // dirt
  'm', // marsh
  'n', // snow
];

const tileAssets = [];
let i = 0;
for (let tl = 0; tl < TILE_TYPES.length; tl++) {
  const tlv = TILE_TYPES[tl];
  for (let tr = 0; tr < TILE_TYPES.length; tr++) {
    const trv = TILE_TYPES[tr];
    for (let bl = 0; bl < TILE_TYPES.length; bl++) {
      const blv = TILE_TYPES[bl];
      for (let br = 0; br < TILE_TYPES.length; br++) {
        const brv = TILE_TYPES[br];
        const type = 'tile';
        const mode = `${tlv}${trv}${blv}${brv}`;
        tileAssets.push({ frame: i, type, mode });
        i++;
      }
    }
  }
}

fs.writeFileSync(
  './apps/game/public/assets/tilemap.json',
  JSON.stringify(tileAssets, undefined, 2),
);

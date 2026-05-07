const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../apps/game/public/assets/modules.json');
const dest = path.resolve(__dirname, '../apps/game/public/assets/modules.data');

const modules = JSON.parse(fs.readFileSync(src, 'utf-8'));

const lines = modules.map(mod => {
  const tiles = mod.tiles.join(':');
  const entities = (mod.entities || []).map(e => `${e.id},${e.col},${e.row}`).join(':');
  return `${mod.id}#${mod.name}#${mod.type}#${tiles}#${entities}`;
});

fs.writeFileSync(dest, lines.join('\n'), 'utf-8');
console.log(`Migrated ${modules.length} modules to ${dest}`);

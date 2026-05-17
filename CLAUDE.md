# Absenat: Claude Rules

## 🛠 Commands (for Claude Code)
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Generate Tiles**: `npm run generate-tiles`

Refer to `docs/player-stats.md` for player stat definitions.

## 🎯 Project Overview
Absenat is a tile-based exploration game built with Phaser 4 and React 19.

## 🛠 Tech Stack
- **Engine**: Phaser 4 (TypeScript)
- **UI**: React 19 (Functional components, Hooks)
- **Build Tool**: Vite
- **Assets**: Generated via `scripts/generate-tilemap.js` using `sharp`.

## 🎨 Styling & Aesthetics
- **No Tailwind/PostCSS**: Use standard CSS or CSS Modules.
- **Component Structure**: Each React component should live in its own subfolder under `src/components/` with its own CSS module (e.g., `src/components/Button/Button.tsx` + `Button.module.css`).
- **Visual Style**: All assets must be **pixel art**.

## 📁 Assets
- Static game assets are located in `public/data-assets/`.
  - `public/data-assets/tilemaps/`: Tilemap files.
  - `public/data-assets/characters/`: Character files.
- Generated assets (like the large tilemap PNG) are in `public/assets/`.

## 🗺 Tile Mode Format
Each tile record in `tilemap.json` has two fields:
- `frame`: integer index into `tilemap.png` (column-major, 16px grid).
- `mode`: a **4-character string** encoding the biome at each corner of the 16×16 tile.

Corner order (left-to-right in the string):
```
[0] Top-left  [1] Top-right
[2] Bot-left  [3] Bot-right
```

Biome characters:
| Char | Biome |
|------|-------|
| `g`  | Grass |
| `a`  | Sand  |
| `i`  | Ice   |
| `w`  | Water |
| `d`  | Dirt  |
| `m`  | Marsh |
| `n`  | Snow  |
| `o`  | Wood  |

Example: `"gwgw"` = grass top-left & bottom-left, water top-right & bottom-right (a vertical grass/water edge tile).

Tiles are stored and displayed sorted by `mode` (alphabetical). The asset-manager's `ModeModal` component is the canonical UI for assigning a mode when staging a new tile.

## 📜 Development Rules
1. **TypeScript Only**: No `any`. Use strict typing.
2. **WASD Movement**: All character movement must use WASD keys.
3. **Phaser Architecture**:
   - Use classes for Scenes and GameObjects.
   - Keep game logic modular (e.g., `src/game/player`, `src/game/world`).
4. **State Management**:
   - Phaser handles game state.
   - React handles UI/Overlay state.
5. **Naming**: PascalCase for classes/types, camelCase for variables/functions.
6. **Method Extraction**: If a class method exceeds 10 lines, extract it into a separate file in the same directory.
   - Define the extracted function with a `this` parameter to preserve context: `export function methodName(this: ClassName, ...args)`.
   - In the class, import and assign the function to a property: `protected methodName = methodName;`.
7. **Domain Types**: For types specific to a class's business domain, create a `types.ts` file in the same directory.
   - **Literals to Enums**: Avoid using string literal unions directly. Instead, define an `enum` and a corresponding type. Example:
     ```typescript
     export enum Biome {
       Snow = 'snow',
       Ice = 'ice'
     }
     export type BiomeType = Biome;
     ```
8. **Atomic Functions**: Prioritize small, atomic functions that do one thing. Functions should ideally be under 15 lines of code. Break down complex logic into specialized helper functions within the same file or module.

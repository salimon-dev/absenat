const FRAME_SIZE = 16;

export enum ToolType {
  Bow = 'bow',
  Sword = 'sword',
  Axe = 'axe',
  Pickaxe = 'pickaxe',
  Hammer = 'hammer',
}

const TOOL_NAMES = [
  ToolType.Bow,
  ToolType.Sword,
  ToolType.Axe,
  ToolType.Pickaxe,
  ToolType.Hammer,
];

export type ToolName = ToolType;

export interface ToolFrame {
  name: ToolName;
  image: string;
}

export async function loadToolFrames(): Promise<ToolFrame[]> {
  const img = await loadImage('assets/tools.png');
  return TOOL_NAMES.map((name, row) => ({
    name,
    image: extractFrame(img, row),
  }));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function extractFrame(img: HTMLImageElement, row: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, row * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, 0, 0, FRAME_SIZE, FRAME_SIZE);
  return canvas.toDataURL('image/png');
}

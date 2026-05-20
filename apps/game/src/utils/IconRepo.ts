import { RESOURCE_NAMES } from './resources';
import { TOOL_NAMES } from './tools';

const ICON_FRAME_SIZE = 16;
const RESOURCE_ICON_SHEET = 'assets/resource.png';
const TOOL_ICON_SHEET = 'assets/tools.png';

interface IconDefinition {
  src: string;
  frame: number;
}

const ICONS = new Map<string, IconDefinition>(
  [
    ...TOOL_NAMES.map((name, frame): [string, IconDefinition] => [
      name,
      { src: TOOL_ICON_SHEET, frame }
    ]),
    ...RESOURCE_NAMES.map((name, frame): [string, IconDefinition] => [
      name,
      { src: RESOURCE_ICON_SHEET, frame }
    ])
  ]
);

export class IconRepo {
  private static readonly images = new Map<string, Promise<HTMLImageElement>>();
  private static readonly frames = new Map<string, Promise<string>>();

  static getIcon(name: string): Promise<string> {
    const icon = ICONS.get(name);
    if (!icon) return Promise.reject(new Error(`Unknown icon: ${name}`));
    return this.getFrame(icon);
  }

  private static getFrame(icon: IconDefinition): Promise<string> {
    const key = `${icon.src}:${icon.frame}`;
    const cached = this.frames.get(key);
    if (cached) return cached;
    return this.cacheFrame(key, icon);
  }

  private static cacheFrame(key: string, icon: IconDefinition): Promise<string> {
    const frame = this.loadFrame(icon);
    this.frames.set(key, frame);
    return frame;
  }

  private static async loadFrame(icon: IconDefinition): Promise<string> {
    const image = await this.getImage(icon.src);
    return extractFrame(image, icon.frame);
  }

  private static getImage(src: string): Promise<HTMLImageElement> {
    const cached = this.images.get(src);
    if (cached) return cached;
    return this.cacheImage(src);
  }

  private static cacheImage(src: string): Promise<HTMLImageElement> {
    const image = downloadImage(src);
    this.images.set(src, image);
    return image;
  }
}

async function downloadImage(src: string): Promise<HTMLImageElement> {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Failed to download icon sheet: ${src}`);
  return loadImage(await response.blob());
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolveLoadedImage(img, objectUrl, resolve);
    img.onerror = () => rejectImageLoad(objectUrl, reject);
    img.src = objectUrl;
  });
}

function resolveLoadedImage(
  image: HTMLImageElement,
  objectUrl: string,
  resolve: (image: HTMLImageElement) => void
): void {
  URL.revokeObjectURL(objectUrl);
  resolve(image);
}

function rejectImageLoad(objectUrl: string, reject: (reason?: unknown) => void): void {
  URL.revokeObjectURL(objectUrl);
  reject(new Error('Failed to decode icon sheet'));
}

function extractFrame(image: HTMLImageElement, frame: number): string {
  const canvas = createIconCanvas();
  const ctx = getCanvasContext(canvas);
  drawFrame(ctx, image, frame);
  return canvas.toDataURL('image/png');
}

function createIconCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = ICON_FRAME_SIZE;
  canvas.height = ICON_FRAME_SIZE;
  return canvas;
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');
  return ctx;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: number
): void {
  const source = getFrameSource(image, frame);
  ctx.drawImage(image, source.x, source.y, ICON_FRAME_SIZE, ICON_FRAME_SIZE, 0, 0, ICON_FRAME_SIZE, ICON_FRAME_SIZE);
}

function getFrameSource(image: HTMLImageElement, frame: number): { x: number; y: number } {
  const columns = Math.max(1, Math.floor(image.width / ICON_FRAME_SIZE));
  return {
    x: (frame % columns) * ICON_FRAME_SIZE,
    y: Math.floor(frame / columns) * ICON_FRAME_SIZE,
  };
}

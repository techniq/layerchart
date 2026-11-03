import {
  CanvasTexture,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  LinearSRGBColorSpace,
  type Material,
} from 'three';

import type { ResolvedColor } from './color.js';

/** Canvas pixels per pixel of the plot, so text stays sharp up close */
const RESOLUTION = 4;

let measure: CanvasRenderingContext2D | null = null;

/**
 * `text` painted onto a plane in the scene, `fontSize` pixels of the plot tall, standing in the
 * plane's `x` / `y` (facing `+z`, reading along `x`, centered).  Lit like the surface it's on, so
 * it shades along with it.  `null` without a canvas (ex. on the server).
 */
export function labelPlane(
  text: string,
  {
    fontSize,
    fontWeight,
    color,
    family = fontFamily(),
    maxWidth,
    lineHeight = 1.2,
    align = 'middle',
  }: {
    fontSize: number;
    fontWeight: number | string;
    color: ResolvedColor | null;
    /** The font family, if already looked up (ex. once for many labels) */
    family?: string;
    /** Wrap words onto more lines to keep within this many pixels of the plot */
    maxWidth?: number;
    /** Line spacing, in multiples of the font size */
    lineHeight?: number;
    /** How wrapped lines line up with each other */
    align?: 'start' | 'middle' | 'end';
  }
): { mesh: Mesh; width: number; height: number } | null {
  if (typeof document === 'undefined' || !(fontSize > 0)) return null;
  const font = `${fontWeight} ${fontSize * RESOLUTION}px ${family}`;
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return null;
  measure.font = font;
  const lines = maxWidth ? wrap(text, maxWidth * RESOLUTION, measure) : text.split('\n');
  const width = Math.ceil(Math.max(...lines.map((line) => measure!.measureText(line).width))) + 2;
  const step = fontSize * RESOLUTION * lineHeight;
  const height = Math.ceil(fontSize * RESOLUTION * 1.3 + step * (lines.length - 1));

  const label = document.createElement('canvas');
  label.width = width;
  label.height = height;
  const paint = label.getContext('2d')!;
  paint.font = font;
  paint.textAlign = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
  paint.textBaseline = 'middle';
  // Painted in the color's linear values, read by the shader as they are (a linear texture), and
  // encoded for the screen with the rest of the scene.  An sRGB texture of sRGB values should do
  // the same, but came out decoded twice over: the text color washed out to grey.
  const linear = color?.color;
  paint.fillStyle = linear
    ? `rgb(${Math.round(linear.r * 255)} ${Math.round(linear.g * 255)} ${Math.round(linear.b * 255)})`
    : 'black';
  paint.globalAlpha = color?.opacity ?? 1;
  const x = align === 'start' ? 1 : align === 'end' ? width - 1 : width / 2;
  const first = (fontSize * RESOLUTION * 1.3) / 2;
  lines.forEach((line, i) => paint.fillText(line, x, first + step * i));

  const texture = new CanvasTexture(label);
  texture.colorSpace = LinearSRGBColorSpace;
  // Blended by coverage at the glyphs' edges, rather than against transparent black
  texture.premultiplyAlpha = true;
  texture.anisotropy = 8;
  const mesh = new Mesh(
    new PlaneGeometry(width / RESOLUTION, height / RESOLUTION),
    new MeshLambertMaterial({
      map: texture,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    })
  );
  return { mesh, width: width / RESOLUTION, height: height / RESOLUTION };
}

/** `text`'s words wrapped onto lines `maxWidth` wide (as measured by `context`), as SVG text wraps */
function wrap(text: string, maxWidth: number, context: CanvasRenderingContext2D) {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** The page's font family, for labels to match its text */
export function fontFamily() {
  return typeof document === 'undefined'
    ? 'sans-serif'
    : getComputedStyle(document.body).fontFamily;
}

/** Free a `labelPlane`'s geometry, texture, and material */
export function disposeLabel(mesh: Mesh) {
  mesh.geometry.dispose();
  const material = mesh.material as Material & { map?: { dispose(): void } | null };
  material.map?.dispose();
  material.dispose();
}

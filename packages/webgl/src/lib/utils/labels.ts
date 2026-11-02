import {
  CanvasTexture,
  LinearFilter,
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
  }: { fontSize: number; fontWeight: number | string; color: ResolvedColor | null }
): { mesh: Mesh; width: number } | null {
  if (typeof document === 'undefined' || !(fontSize > 0)) return null;
  const family = getComputedStyle(document.body).fontFamily;
  const font = `${fontWeight} ${fontSize * RESOLUTION}px ${family}`;
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return null;
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width) + 2;
  const height = Math.ceil(fontSize * RESOLUTION * 1.3);

  const label = document.createElement('canvas');
  label.width = width;
  label.height = height;
  const paint = label.getContext('2d')!;
  paint.font = font;
  paint.textAlign = 'center';
  paint.textBaseline = 'middle';
  // Painted in the color's linear values, read by the shader as they are (a linear texture), and
  // encoded for the screen with the rest of the scene.  An sRGB texture of sRGB values should do
  // the same, but came out decoded twice over: the text color washed out to grey.
  const linear = color?.color;
  paint.fillStyle = linear
    ? `rgb(${Math.round(linear.r * 255)} ${Math.round(linear.g * 255)} ${Math.round(linear.b * 255)})`
    : 'black';
  paint.globalAlpha = color?.opacity ?? 1;
  paint.fillText(text, width / 2, height / 2);

  const texture = new CanvasTexture(label);
  texture.colorSpace = LinearSRGBColorSpace;
  // Blended by coverage at the glyphs' edges, rather than against transparent black
  texture.premultiplyAlpha = true;
  texture.anisotropy = 8;
  // Not averaged down a mip chain, which washes thin strokes out to grey at a label's usual size
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  const mesh = new Mesh(
    new PlaneGeometry(width / RESOLUTION, height / RESOLUTION),
    new MeshLambertMaterial({
      map: texture,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    })
  );
  return { mesh, width: width / RESOLUTION };
}

/** Free a `labelPlane`'s geometry, texture, and material */
export function disposeLabel(mesh: Mesh) {
  mesh.geometry.dispose();
  const material = mesh.material as Material & { map?: { dispose(): void } | null };
  material.map?.dispose();
  material.dispose();
}

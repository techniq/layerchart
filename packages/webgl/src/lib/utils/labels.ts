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
/** Pixels of the plot each glyph is traced with in its own color, to keep its weight */
const WEIGHT_STROKE = 0.35;

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
    stroke = null,
    strokeWidth = 1,
  }: {
    fontSize: number;
    fontWeight: number | string;
    color: ResolvedColor | null;
    /** A halo around the letters, behind them, as an SVG stroke with `paint-order: stroke` */
    stroke?: ResolvedColor | null;
    /** The halo's width in pixels of the plot, half of it outside the letters */
    strokeWidth?: number;
    /** The font family, if already looked up (ex. once for many labels) */
    family?: string;
    /** Wrap words onto more lines to keep within this many pixels of the plot */
    maxWidth?: number;
    /** Line spacing, in multiples of the font size */
    lineHeight?: number;
    /** How wrapped lines line up with each other */
    align?: 'start' | 'middle' | 'end';
  }
): {
  mesh: Mesh;
  width: number;
  height: number;
  /** Pixels of the plot from its top down to its first line's baseline */
  baseline: number;
  /** How many lines it wrapped to */
  lines: number;
} | null {
  if (typeof document === 'undefined' || !(fontSize > 0)) return null;
  const font = `${fontWeight} ${fontSize * RESOLUTION}px ${family}`;
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return null;
  measure.font = font;
  const lines = maxWidth ? wrap(text, maxWidth * RESOLUTION, measure) : text.split('\n');
  // Room around the letters for the halo's outer half
  const pad = stroke && strokeWidth > 0 ? Math.ceil((strokeWidth * RESOLUTION) / 2) : 0;
  const width =
    Math.ceil(Math.max(...lines.map((line) => measure!.measureText(line).width))) + 2 + pad * 2;
  const step = fontSize * RESOLUTION * lineHeight;
  // Room above the first baseline and below the last, as the font measures it
  const metrics = measure.measureText('Hg');
  const ascent = metrics.fontBoundingBoxAscent || fontSize * RESOLUTION * 0.95;
  const descent = metrics.fontBoundingBoxDescent || fontSize * RESOLUTION * 0.3;
  const height = Math.ceil(ascent + descent + step * (lines.length - 1)) + pad * 2;

  const label = document.createElement('canvas');
  label.width = width;
  label.height = height;
  const paint = label.getContext('2d')!;
  paint.font = font;
  paint.textAlign = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
  // On their baselines, so a label can be placed by its cap height as the core `Text` places it
  paint.textBaseline = 'alphabetic';
  // Painted in the color's linear values, read by the shader as they are (a linear texture), and
  // encoded for the screen with the rest of the scene.  An sRGB texture of sRGB values should do
  // the same, but came out decoded twice over: the text color washed out to grey.
  const css = (value: ResolvedColor['color'] | undefined) =>
    value
      ? `rgb(${Math.round(value.r * 255)} ${Math.round(value.g * 255)} ${Math.round(value.b * 255)})`
      : 'black';
  const x = align === 'start' ? 1 + pad : align === 'end' ? width - 1 - pad : width / 2;
  const first = ascent + pad;
  if (pad) {
    // The halo first, so the letters cover its inner half
    paint.strokeStyle = css(stroke!.color);
    paint.globalAlpha = stroke!.opacity;
    paint.lineWidth = strokeWidth * RESOLUTION;
    paint.lineJoin = 'round';
    lines.forEach((line, i) => paint.strokeText(line, x, first + step * i));
  }
  // Translucent letters are painted opaque on a canvas of their own, then laid over at their
  // alpha, so where their hairline (below) covers their fill they don't come out more opaque
  const alpha = color?.opacity ?? 1;
  const letters = alpha < 1 ? document.createElement('canvas') : label;
  if (letters !== label) {
    letters.width = width;
    letters.height = height;
  }
  const ink = letters === label ? paint : letters.getContext('2d')!;
  ink.font = font;
  ink.textAlign = paint.textAlign;
  ink.textBaseline = paint.textBaseline;
  ink.fillStyle = css(color?.color);
  ink.globalAlpha = 1;
  lines.forEach((line, i) => ink.fillText(line, x, first + step * i));
  // Shrunk to size by the GPU and blended in linear light, glyphs come out thinner than the
  // browser draws them: a hairline of their own color brings back their weight
  ink.strokeStyle = ink.fillStyle;
  ink.lineWidth = WEIGHT_STROKE * RESOLUTION;
  ink.lineJoin = 'round';
  lines.forEach((line, i) => ink.strokeText(line, x, first + step * i));
  if (letters !== label) {
    paint.globalAlpha = alpha;
    paint.drawImage(letters, 0, 0);
  }

  const texture = new CanvasTexture(label);
  texture.colorSpace = LinearSRGBColorSpace;
  // Premultiplied as it's sampled, so a glyph's edge blends by coverage rather than with the
  // transparent black around it; the material takes the alpha back out once sampled (below)
  texture.premultiplyAlpha = true;
  texture.anisotropy = 8;
  const material = new MeshLambertMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  // Its color back to as painted (the alpha taken out), then lit, faded by `opacity`, encoded,
  // and blended as any other's.  Left premultiplied, three.js multiplies by the alpha again, and
  // the letters' and halo's edges come out dark: a grey ring around a white halo.
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\n#ifdef USE_MAP\n\tdiffuseColor.rgb /= max( sampledDiffuseColor.a, 0.0001 );\n#endif'
    );
  };
  material.customProgramCacheKey = () => 'lc-label-unpremultiplied';
  const mesh = new Mesh(new PlaneGeometry(width / RESOLUTION, height / RESOLUTION), material);
  return {
    mesh,
    width: width / RESOLUTION,
    height: height / RESOLUTION,
    baseline: first / RESOLUTION,
    lines: lines.length,
  };
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

/** A label painted once, shared by every plane showing it */
type SharedLabel = {
  mesh: Mesh;
  width: number;
  height: number;
  baseline: number;
  lines: number;
  /** How many planes show it */
  refs: number;
};

/** Painted labels by how they're painted (see `acquireLabel`) */
const shared = new Map<string, SharedLabel>();

/** A label's plane, showing a painting shared with others painted the same */
export type AcquiredLabel = Omit<SharedLabel, 'refs'> & { key: string };

/**
 * A plane showing the label `key` names, painting it (`paint`) only when no plane shows it already:
 * labels that pass between marks (ex. a treemap's, its rows drawn in a new order as the view
 * turns) keep their paintings rather than measuring and painting their text again.  `key` must
 * name everything the painting depends on.  `release` it when it's no longer shown.
 */
export function acquireLabel(
  key: string,
  paint: () => Omit<SharedLabel, 'refs'> | null
): AcquiredLabel | null {
  let label = shared.get(key);
  if (!label) {
    const made = paint();
    if (!made) return null;
    label = { ...made, refs: 0 };
    shared.set(key, label);
  }
  label.refs++;
  // Its own plane (a mesh has one parent), drawing the shared geometry and painting
  const mesh = new Mesh(label.mesh.geometry, label.mesh.material);
  return { ...label, mesh, key };
}

/**
 * Stop showing an acquired label's plane.  Its painting is freed a frame after the last plane
 * showing it goes, so a label passed to another mark in the same update is kept.
 */
export function releaseLabel(label: AcquiredLabel) {
  const entry = shared.get(label.key);
  if (!entry) return;
  entry.refs--;
  if (entry.refs > 0) return;
  const later =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (fn: () => void) => setTimeout(fn, 16);
  later(() => {
    if (entry.refs > 0 || shared.get(label.key) !== entry) return;
    shared.delete(label.key);
    disposeLabel(entry.mesh);
  });
}

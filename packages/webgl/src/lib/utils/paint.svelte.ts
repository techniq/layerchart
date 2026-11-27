import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  LinearFilter,
  Mesh,
  MeshLambertMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Group,
} from 'three';
import type { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import type { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import type { buildPatternShapes } from 'layerchart/base';

import type { SceneState } from '../contexts/scene.svelte.js';

/**
 * A `LinearGradient` as a scene draws it: its stops and direction, as the core `LinearGradient`'s
 * SVG `<linearGradient>` has them (its fields read its props as they change)
 */
export type LinearGradientPaint = {
  type: 'linear';
  readonly stops: (string | [string | number, string])[];
  /** The class its stops have (ex. `from-primary to-secondary`, which set the stops' colors) */
  readonly classes: string | undefined;
  readonly x1: string;
  readonly y1: string;
  readonly x2: string;
  readonly y2: string;
  /** Degrees, as its `gradientTransform="rotate(...)"` */
  readonly rotate: number | undefined;
  readonly units: 'objectBoundingBox' | 'userSpaceOnUse';
  /** The size `userSpaceOnUse` percentages are of: the chart's, as SVG's viewport */
  readonly viewport: { width: number; height: number };
};

/** A `Pattern` as a scene draws it: its tile and what's in it, as the core `Pattern`'s */
export type PatternPaint = {
  type: 'pattern';
  readonly width: number;
  readonly height: number;
  readonly shapes: PatternShape[];
  /** A CSS color, or a gradient's `url(#id)` drawn across each tile */
  readonly background: string | undefined;
};

export type Paint = LinearGradientPaint | PatternPaint;

/** A line, circle, or rect in a pattern's tile, as the core `Pattern` lays them out */
type PatternShape = ReturnType<typeof buildPatternShapes>[number];

const registries = new WeakMap<SceneState, SvelteMap<string, Paint>>();

function registryOf(scene: SceneState) {
  let registry = registries.get(scene);
  if (!registry) registries.set(scene, (registry = new SvelteMap()));
  return registry;
}

/**
 * Define `paint` as `id` in `scene` while the calling component lives, so marks drawn with
 * `url(#id)` as their fill or stroke paint it.  Call during component setup.
 */
export function registerPaint(scene: SceneState, id: () => string, paint: Paint) {
  const registry = registryOf(scene);
  // At once, so the marks inside find it as they first draw
  let current = untrack(id);
  registry.set(current, paint);
  $effect.pre(() => {
    const next = id();
    if (next === current) return;
    untrack(() => {
      if (registry.get(current) === paint) registry.delete(current);
      registry.set(next, paint);
    });
    current = next;
  });
  $effect(() => () => {
    const gone = current;
    // Not written in the teardown itself (see `SceneState.addLabels`)
    queueMicrotask(() => {
      if (registry.get(gone) === paint) registry.delete(gone);
    });
    if (paint.type === 'pattern') {
      textures.get(paint)?.texture.dispose();
      textures.delete(paint);
    }
  });
}

/** Whether `scene` has any paint defined (so marks needn't look for one in each row's color) */
export function hasPaints(scene: SceneState) {
  return registryOf(scene).size > 0;
}

/**
 * The paint a fill or stroke names (`url(#id)`, as SVG's), or `null` for a color: only a
 * `url(...)` value is looked up, so marks drawn in plain colors pay nothing
 */
export function paintOf(scene: SceneState, value: unknown): Paint | null {
  if (typeof value !== 'string' || !value.startsWith('url(')) return null;
  const id = /^url\(\s*["']?#([^"')]+)["']?\s*\)/.exec(value)?.[1];
  return id == null ? null : (registryOf(scene).get(id) ?? null);
}

/** A box in the plot's pixels (`x` across, `y` down) */
export type Box = { x: number; y: number; width: number; height: number };

/** sRGB (or linear RGB) and alpha, each 0 to 1 */
type RGBA = [number, number, number, number];
/** A stop's offset, its sRGB and alpha, and its color in Oklab */
type Stop = { offset: number; rgba: RGBA; lab: [number, number, number] };
/** What a gradient blends its stops in: sRGB with legacy colors only, else Oklab, as CSS */
type Space = 'srgb' | 'oklab';

/** An SVG `offset`: a number (0 to 1), or a percentage */
function parseOffset(value: string | number): number {
  if (typeof value === 'number') return value;
  const n = parseFloat(value);
  return value.trim().endsWith('%') ? n / 100 : n;
}

const srgb = { r: 0, g: 0, b: 0 };

/** Linear RGB as Oklab */
function toOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Oklab as linear RGB (in gamut), into `out` */
function fromOklab([L, a, b]: number[], out: RGBA) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  out[0] = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  out[1] = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  out[2] = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
}

/**
 * A CSS color as sRGB and alpha, as the scene resolves it (`classes` set on what it's read on),
 * and whether it's a legacy color (`rgb()`, `hsl()`, hex, or named), which CSS blends in sRGB
 */
function rgbaOf(
  scene: SceneState,
  value: string,
  classes: string | undefined
): { rgba: RGBA; legacy: boolean } | null {
  // On an SVG shape (with the stops' class, as the core `LinearGradient`'s `<stop>`s have it, ex.
  // `from-primary`, which sets the `--tw-gradient-from` its default stops read), as computed
  const computed = scene.style(classes ?? '', { style: `fill: ${value}` })?.fill ?? value;
  const resolved = scene.color(computed);
  if (!resolved) return null;
  // A translucent color's own RGB, opaque: read back translucent, it loses it (all of it when
  // clear, ex. `rgb(... / 0)`), which would tint the blend towards its neighbors
  const opaque =
    resolved.opacity < 1 && relativeColors()
      ? scene.color(`rgb(from ${computed} r g b / 1)`)
      : null;
  (opaque ?? resolved).color.getRGB(srgb, SRGBColorSpace);
  return {
    rgba: [srgb.r, srgb.g, srgb.b, resolved.opacity],
    legacy: /^((rgba?|hsla?|hwb)\(|#|[a-z]+$)/i.test(computed.trim()),
  };
}

let relative: boolean | undefined;
/** Whether the browser reads CSS relative colors (`rgb(from ... r g b / 1)`) */
function relativeColors() {
  return (relative ??= globalThis.CSS?.supports?.('color', 'rgb(from red r g b / 1)') ?? false);
}

/**
 * A gradient's stops, resolved: their offsets (each at least the one before, as SVG's) and colors,
 * and the space it blends them in
 */
function resolveStops(
  scene: SceneState,
  paint: LinearGradientPaint
): { stops: Stop[]; space: Space } | null {
  const stops = paint.stops;
  if (!stops.length) return null;
  const out: Stop[] = [];
  let last = 0;
  let legacy = true;
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const [offset, color] = Array.isArray(stop)
      ? [parseOffset(stop[0]), stop[1]]
      : [stops.length > 1 ? i / (stops.length - 1) : 0, stop];
    const resolved = rgbaOf(scene, color, paint.classes);
    if (!resolved) return null;
    legacy &&= resolved.legacy;
    const { rgba } = resolved;
    linear.setRGB(rgba[0], rgba[1], rgba[2], SRGBColorSpace);
    last = Math.max(last, Math.min(1, Math.max(0, Number.isFinite(offset) ? offset : 0)));
    out.push({ offset: last, rgba, lab: toOklab(linear.r, linear.g, linear.b) });
  }
  return { stops: out, space: legacy ? 'srgb' : 'oklab' };
}

const mixed: RGBA = [0, 0, 0, 0];

/**
 * A gradient's linear RGB and alpha at `t` (0 at its start, 1 at its end), padded past its ends
 */
function colorAt(stops: Stop[], space: Space, t: number, out: RGBA) {
  const last = stops[stops.length - 1];
  let [a, b, s] = [stops[0], stops[0], 0];
  if (t >= last.offset) [a, b] = [last, last];
  else if (t > stops[0].offset) {
    // The stops either side (past a hard stop's pair, the later one's color)
    let k = 1;
    while (stops[k].offset <= t) k++;
    [a, b] = [stops[k - 1], stops[k]];
    s = (t - a.offset) / (b.offset - a.offset);
  }
  // Unpremultiplied, as SVG blends its stops (with a clear stop's own color, see `rgbaOf`)
  const [ca, cb] = space === 'oklab' ? [a.lab, b.lab] : [a.rgba, b.rgba];
  for (let c = 0; c < 3; c++) mixed[c] = ca[c] + (cb[c] - ca[c]) * s;
  if (space === 'oklab') fromOklab(mixed, out);
  else {
    linear.setRGB(mixed[0], mixed[1], mixed[2], SRGBColorSpace);
    [out[0], out[1], out[2]] = [linear.r, linear.g, linear.b];
  }
  out[3] = a.rgba[3] + (b.rgba[3] - a.rgba[3]) * s;
}

/** A gradient coordinate (`x1`, ...): a fraction of the box, or pixels (`%` of `extent`) */
function coordinate(value: string, units: LinearGradientPaint['units'], extent: number) {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  const percent = value.trim().endsWith('%');
  if (units === 'objectBoundingBox') return percent ? n / 100 : n;
  return percent ? (n / 100) * extent : n;
}

/**
 * Where along a gradient each point of the plot is (`t = a·x + b·y + c`, 0 at its start, 1 at its
 * end), over `box` (the shape's bounds, for `objectBoundingBox`), as SVG lays it out: its vector
 * from (`x1`, `y1`) to (`x2`, `y2`), turned by `rotate` about its space's origin
 */
export function gradientAffine(
  paint: LinearGradientPaint,
  box: Box
): [a: number, b: number, c: number] {
  const { units, viewport } = paint;
  const x1 = coordinate(paint.x1, units, viewport.width);
  const y1 = coordinate(paint.y1, units, viewport.height);
  const dx = coordinate(paint.x2, units, viewport.width) - x1;
  const dy = coordinate(paint.y2, units, viewport.height) - y1;
  const length = dx * dx + dy * dy;
  // No length: the last stop's color throughout, as SVG
  if (!length) return [0, 0, 1];
  const angle = ((paint.rotate ?? 0) * Math.PI) / 180;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  // A point turned back by `rotate`, onto the vector
  const A = (cos * dx - sin * dy) / length;
  const B = (sin * dx + cos * dy) / length;
  const C = -(x1 * dx + y1 * dy) / length;
  if (units === 'userSpaceOnUse') return [A, B, C];
  // From the box's own space (0 to 1 across each side)
  const a = box.width ? A / box.width : 0;
  const b = box.height ? B / box.height : 0;
  return [a, b, C - a * box.x - b * box.y];
}

/**
 * A gradient over a shape: where along it each point is, the places its color changes course
 * (`cuts`), and its color between them.  Shapes are cut at each, so blending between their
 * vertices follows the gradient's stops (and keeps to SVG's sRGB blend between stops of different
 * colors).
 */
export type Shader = {
  t: (x: number, y: number) => number;
  cuts: number[];
  /** Linear RGB and alpha at `t`, within `[lo, hi]` (to take a hard stop's side) */
  color: (t: number, lo: number, hi: number, out: RGBA) => void;
  /** Its stops' colors and its layout, to tell when it's changed */
  key: string;
};

const linear = new Color();

/** A `LinearGradient` over `box` as a `Shader`, or `null` before its colors resolve */
export function gradientShader(
  scene: SceneState,
  paint: LinearGradientPaint,
  box: Box
): Shader | null {
  const resolved = resolveStops(scene, paint);
  if (!resolved) return null;
  const { stops, space } = resolved;
  const [a, b, c] = gradientAffine(paint, box);
  const cuts: number[] = [];
  for (let i = 0; i < stops.length; i++) {
    const { offset } = stops[i];
    if (cuts[cuts.length - 1] !== offset) cuts.push(offset);
    const next = stops[i + 1];
    if (!next || next.offset <= offset) continue;
    // Steps between stops of different colors, as a vertex blend is linear light, not sRGB (or
    // Oklab)
    const diff = Math.max(...[0, 1, 2].map((k) => Math.abs(next.rgba[k] - stops[i].rgba[k])));
    const steps = Math.min(8, Math.ceil(diff * 8));
    for (let s = 1; s < steps; s++) cuts.push(offset + ((next.offset - offset) * s) / steps);
  }
  return {
    t: (x, y) => a * x + b * y + c,
    cuts,
    key: JSON.stringify([stops, space, a, b, c]),
    color: (t, lo, hi, out) => {
      const e = 1e-7;
      const at = hi - lo <= 2 * e ? (lo + hi) / 2 : Math.min(Math.max(t, lo + e), hi - e);
      colorAt(stops, space, at, out);
    },
  };
}

/** The bounds of points in the scene's axes (`x` across, height, `y` down), on the floor */
export function boxOf(points: ArrayLike<number>): Box {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i + 2 < points.length; i += 3) {
    const [x, y] = [points[i], points[i + 2]];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return x0 <= x1
    ? { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
    : { x: 0, y: 0, width: 0, height: 0 };
}

/** The cuts between `lo` and `hi` (either way round), in order from `lo` */
function cutsBetween(cuts: number[], lo: number, hi: number) {
  const [min, max] = lo < hi ? [lo, hi] : [hi, lo];
  const inside = cuts.filter((c) => c > min + 1e-9 && c < max - 1e-9);
  return lo < hi ? inside : inside.reverse();
}

/** The cuts either side of `t`: the slab it's in */
function slabOf(cuts: number[], t: number): [number, number] {
  let lo = -Infinity;
  let hi = Infinity;
  for (const c of cuts) {
    if (c <= t) lo = c;
    else {
      hi = c;
      break;
    }
  }
  return [lo, hi];
}

type Vertex = { p: [number, number, number]; t: number };

/** A convex polygon's part on one side of `bound` (`above` it, or below) */
function clip(polygon: Vertex[], bound: number, above: boolean): Vertex[] {
  const out: Vertex[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const aIn = above ? a.t >= bound : a.t <= bound;
    const bIn = above ? b.t >= bound : b.t <= bound;
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      const s = (bound - a.t) / (b.t - a.t);
      out.push({
        p: [0, 1, 2].map((k) => a.p[k] + (b.p[k] - a.p[k]) * s) as [number, number, number],
        t: bound,
      });
    }
  }
  return out;
}

/**
 * A shape's triangles (non-indexed, in the scene's axes) colored by `shader`: cut where its color
 * changes course, each vertex in its color there.  Appends to `positions`, `normals` (each
 * triangle's first vertex's), and `colors` (RGBA); returns whether any is translucent.
 */
export function shadeTriangles(
  geometry: BufferGeometry,
  shader: Shader,
  positions: number[],
  normals: number[],
  colors: number[]
): boolean {
  const source = geometry.getAttribute('position').array;
  const sourceNormals = geometry.getAttribute('normal')?.array;
  const rgba: RGBA = [0, 0, 0, 0];
  let translucent = false;
  const emit = (v: Vertex, normal: number[], lo: number, hi: number) => {
    positions.push(v.p[0], v.p[1], v.p[2]);
    normals.push(normal[0], normal[1], normal[2]);
    shader.color(v.t, lo, hi, rgba);
    colors.push(rgba[0], rgba[1], rgba[2], rgba[3]);
    if (rgba[3] < 1) translucent = true;
  };
  for (let i = 0; i + 8 < source.length; i += 9) {
    const triangle: Vertex[] = [0, 3, 6].map((k) => {
      const p: [number, number, number] = [source[i + k], source[i + k + 1], source[i + k + 2]];
      return { p, t: shader.t(p[0], p[2]) };
    });
    const normal = sourceNormals
      ? [sourceNormals[i], sourceNormals[i + 1], sourceNormals[i + 2]]
      : [0, 1, 0];
    const ts = triangle.map((v) => v.t);
    const [min, max] = [Math.min(...ts), Math.max(...ts)];
    const inner = cutsBetween(shader.cuts, min, max);
    if (!inner.length) {
      const [lo, hi] = slabOf(shader.cuts, (ts[0] + ts[1] + ts[2]) / 3);
      for (const v of triangle) emit(v, normal, lo, hi);
      continue;
    }
    const bounds = [-Infinity, ...inner, Infinity];
    for (let k = 0; k + 1 < bounds.length; k++) {
      const [lo, hi] = [bounds[k], bounds[k + 1]];
      let piece = triangle;
      if (lo > -Infinity) piece = clip(piece, lo, true);
      if (hi < Infinity) piece = clip(piece, hi, false);
      // Fanned out from its first corner (a triangle cut by two lines stays convex)
      for (let j = 1; j + 1 < piece.length; j++) {
        emit(piece[0], normal, lo, hi);
        emit(piece[j], normal, lo, hi);
        emit(piece[j + 1], normal, lo, hi);
      }
    }
  }
  return translucent;
}

/**
 * A polyline's segments (points in the scene's axes) colored by `shader`, cut where its color
 * changes course: each segment's ends (`positions`, 6 a segment), their linear RGB (`colors`, 6 a
 * segment) and alpha (`alphas`, 2 a segment), and for each segment the polyline's segment it's
 * part of and how far along that it starts (`from`)
 */
export function shadeSegments(points: ArrayLike<number>, shader: Shader) {
  const positions: number[] = [];
  const colors: number[] = [];
  const alphas: number[] = [];
  const from: [segment: number, at: number][] = [];
  const rgba: RGBA = [0, 0, 0, 0];
  for (let i = 0; i + 5 < points.length; i += 3) {
    const a = [points[i], points[i + 1], points[i + 2]];
    const b = [points[i + 3], points[i + 4], points[i + 5]];
    const [ta, tb] = [shader.t(a[0], a[2]), shader.t(b[0], b[2])];
    const along = [0, ...cutsBetween(shader.cuts, ta, tb).map((c) => (c - ta) / (tb - ta)), 1];
    for (let k = 0; k + 1 < along.length; k++) {
      const [s0, s1] = [along[k], along[k + 1]];
      const [lo, hi] = slabOf(shader.cuts, ta + (tb - ta) * ((s0 + s1) / 2));
      for (const s of [s0, s1]) {
        for (let m = 0; m < 3; m++) positions.push(a[m] + (b[m] - a[m]) * s);
        shader.color(ta + (tb - ta) * s, lo, hi, rgba);
        colors.push(rgba[0], rgba[1], rgba[2]);
        alphas.push(rgba[3]);
      }
      from.push([i / 3, s0]);
    }
  }
  return { positions, colors, alphas, from };
}

/**
 * A polyline colored by `shader`, as points with a color each (for a `Line2`): its own points,
 * with more where its color changes course (a hard stop's point twice, a color each side).
 * `source` is the polyline's point each is nearest along it.
 */
export function shadePolyline(points: ArrayLike<number>, shader: Shader) {
  const segments = shadeSegments(points, shader);
  const positions: number[] = [];
  const colors: number[] = [];
  const alphas: number[] = [];
  const source: number[] = [];
  const push = (segment: number, end: 0 | 1) => {
    for (let m = 0; m < 3; m++) {
      positions.push(segments.positions[segment * 6 + end * 3 + m]);
      colors.push(segments.colors[segment * 6 + end * 3 + m]);
    }
    alphas.push(segments.alphas[segment * 2 + end]);
    const [line, at] = segments.from[segment];
    const next = segments.from[segment + 1];
    // Its end is where the next one starts along the same polyline segment, else its end
    const s = end === 0 ? at : next && next[0] === line ? next[1] : 1;
    source.push(line + (s >= 0.5 ? 1 : 0));
  };
  const count = segments.from.length;
  for (let k = 0; k < count; k++) {
    if (k === 0) push(0, 0);
    else {
      // A hard stop: its point again, in the next segment's color
      const same = [0, 1, 2].every(
        (m) => Math.abs(segments.colors[k * 6 + m] - segments.colors[(k - 1) * 6 + 3 + m]) < 1e-3
      );
      if (!same || Math.abs(segments.alphas[k * 2] - segments.alphas[(k - 1) * 2 + 1]) >= 1e-3)
        push(k, 0);
    }
    push(k, 1);
  }
  return { positions, colors, alphas, source };
}

const alphaPatched = new WeakSet<LineMaterial>();

/**
 * Let a line material take an alpha at each segment's ends (`setLineAlphas`), as a gradient's
 * stops can (three.js' line colors are RGB only).  Once patched, its lines must all have them.
 */
export function useLineAlphas(material: LineMaterial) {
  if (alphaPatched.has(material)) return;
  alphaPatched.add(material);
  const before = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    before.call(material, shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace(
        'attribute vec3 instanceColorEnd;',
        'attribute vec3 instanceColorEnd;\nattribute float instanceAlphaStart;\nattribute float instanceAlphaEnd;\nvarying float vLcAlpha;'
      )
      .replace(
        'void main() {',
        'void main() {\n\tvLcAlpha = ( position.y < 0.5 ) ? instanceAlphaStart : instanceAlphaEnd;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'varying float vLcAlpha;\nvoid main() {')
      .replace(
        'gl_FragColor = vec4( diffuseColor.rgb, alpha );',
        'gl_FragColor = vec4( diffuseColor.rgb, alpha * vLcAlpha );'
      );
  };
  const key = material.customProgramCacheKey.bind(material);
  material.customProgramCacheKey = () => `${key()}-lc-line-alphas`;
  material.transparent = true;
  material.needsUpdate = true;
}

/** Each segment's alpha at its start and end (2 a segment), for a material `useLineAlphas` patched */
export function setLineAlphas(geometry: LineSegmentsGeometry, alphas: ArrayLike<number>) {
  const buffer = new InstancedInterleavedBuffer(new Float32Array(alphas), 2, 1);
  geometry.setAttribute('instanceAlphaStart', new InterleavedBufferAttribute(buffer, 1, 0));
  geometry.setAttribute('instanceAlphaEnd', new InterleavedBufferAttribute(buffer, 1, 1));
}

/** A polyline's per-point alphas as its segments' (2 a segment), for `setLineAlphas` */
export function segmentAlphas(pointAlphas: ArrayLike<number>) {
  const out: number[] = [];
  for (let i = 0; i + 1 < pointAlphas.length; i++) out.push(pointAlphas[i], pointAlphas[i + 1]);
  return out;
}

/** Each pattern's tile texture, and the colors it was painted in */
const textures = new WeakMap<PatternPaint, { key: string; texture: CanvasTexture }>();

/** A CSS color resolved in the scene, as a color a 2D canvas takes */
function cssOf(scene: SceneState, value: string): string | null {
  const rgba = rgbaOf(scene, value, undefined)?.rgba;
  if (!rgba) return null;
  const [r, g, b] = rgba.slice(0, 3).map((v) => Math.round(v * 255));
  return `rgba(${r}, ${g}, ${b}, ${rgba[3]})`;
}

/** A rect corner radius: pixels, or a percentage of half its side, as the core `Pattern`'s */
function cornerPx(value: number | string | undefined, side: number): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return value.trim().endsWith('%') ? (side / 2) * (n / 100) : n;
}

/**
 * A pattern's tile as a repeating texture, painted as the core `Pattern` paints its canvas tile
 * (at twice the device's pixels, to stay sharp), or `null` before its colors resolve
 */
export function patternTexture(scene: SceneState, paint: PatternPaint): CanvasTexture | null {
  const { width, height, shapes, background } = paint;
  if (!(width > 0 && height > 0)) return null;
  const gradient = paintOf(scene, background);
  const backgroundShader =
    gradient?.type === 'linear'
      ? gradientShader(scene, gradient, { x: 0, y: 0, width, height })
      : null;
  const fills = shapes.map((s) => cssOf(scene, s.type === 'line' ? s.stroke : s.fill));
  const backgroundColor = background && !gradient ? cssOf(scene, background) : null;
  if (fills.some((f) => f == null) || (gradient && !backgroundShader)) return null;
  const scale = Math.max(2, Math.ceil(globalThis.devicePixelRatio ?? 1));
  const key = JSON.stringify([
    width,
    height,
    shapes,
    background,
    fills,
    backgroundColor,
    backgroundShader?.key,
    scale,
  ]);
  const cached = textures.get(paint);
  if (cached && cached.key === key) return cached.texture;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) return null;
  if (backgroundShader) {
    // Across each tile, as SVG fills the tile's background rect with it
    const image = context.createImageData(canvas.width, canvas.height);
    const rgba: RGBA = [0, 0, 0, 0];
    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const t = backgroundShader.t((px + 0.5) / scale, (py + 0.5) / scale);
        const [lo, hi] = slabOf(backgroundShader.cuts, t);
        backgroundShader.color(t, lo, hi, rgba);
        linear.setRGB(rgba[0], rgba[1], rgba[2]);
        linear.getRGB(srgb, SRGBColorSpace);
        const o = (py * canvas.width + px) * 4;
        image.data[o] = srgb.r * 255;
        image.data[o + 1] = srgb.g * 255;
        image.data[o + 2] = srgb.b * 255;
        image.data[o + 3] = rgba[3] * 255;
      }
    }
    context.putImageData(image, 0, 0);
  }
  context.scale(canvas.width / width, canvas.height / height);
  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }
  shapes.forEach((shape, i) => {
    context.save();
    context.globalAlpha = shape.opacity;
    if (shape.type === 'line') {
      context.strokeStyle = fills[i]!;
      context.lineWidth = Number(shape.strokeWidth) || 1;
      context.stroke(new Path2D(shape.path));
    } else if (shape.type === 'circle') {
      context.fillStyle = fills[i]!;
      context.beginPath();
      context.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillStyle = fills[i]!;
      const rx = cornerPx(shape.rx, shape.width);
      const ry = shape.ry == null ? rx : cornerPx(shape.ry, shape.height);
      context.beginPath();
      if (rx > 0 || ry > 0) {
        context.roundRect(shape.x, shape.y, shape.width, shape.height, [{ x: rx, y: ry }]);
      } else context.rect(shape.x, shape.y, shape.width, shape.height);
      context.fill();
    }
    context.restore();
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  // Down the plot is down the tile
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = LinearFilter;
  cached?.texture.dispose();
  textures.set(paint, { key, texture });
  return texture;
}

/**
 * Shapes filled with patterns, a mesh a pattern (its tile repeating from the plot's origin, as an
 * SVG pattern's `userSpaceOnUse` tiles), beside a merged mark's own mesh.  Made only once a mark
 * has a patterned shape.
 */
export function createPatternFills(scene: SceneState, layer: Group) {
  const meshes = new Map<PatternPaint, Mesh<BufferGeometry, MeshLambertMaterial>>();
  /** Each pattern's shapes this time, in the scene's axes: positions and normals */
  let pending = new Map<PatternPaint, { positions: number[]; normals: number[] }>();

  return {
    /** Add a shape (non-indexed) filled with `paint` */
    add(paint: PatternPaint, geometry: BufferGeometry) {
      let entry = pending.get(paint);
      if (!entry) pending.set(paint, (entry = { positions: [], normals: [] }));
      const positions = geometry.getAttribute('position').array;
      const normals = geometry.getAttribute('normal')?.array;
      for (let i = 0; i < positions.length; i++) {
        entry.positions.push(positions[i]);
        entry.normals.push(normals ? normals[i] : i % 3 === 1 ? 1 : 0);
      }
    },
    /** Draw what was added since the last time, at `opacity` */
    update(opacity: number) {
      for (const [paint, mesh] of meshes) {
        if (pending.has(paint)) continue;
        layer.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        meshes.delete(paint);
      }
      for (const [paint, { positions, normals }] of pending) {
        let mesh = meshes.get(paint);
        if (!mesh) {
          const material = new MeshLambertMaterial({ transparent: true, side: DoubleSide });
          mesh = new Mesh(new BufferGeometry(), material);
          mesh.receiveShadow = true;
          layer.add(mesh);
          meshes.set(paint, mesh);
        }
        const uvs: number[] = [];
        for (let i = 0; i + 2 < positions.length; i += 3) {
          uvs.push(positions[i] / paint.width, positions[i + 2] / paint.height);
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        mesh.geometry.dispose();
        mesh.geometry = geometry;
        const texture = patternTexture(scene, paint);
        if (mesh.material.map !== texture) {
          mesh.material.map = texture;
          mesh.material.needsUpdate = true;
        }
        mesh.visible = texture != null;
        mesh.material.opacity = opacity;
      }
      pending = new Map();
    },
    dispose() {
      for (const mesh of meshes.values()) {
        layer.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      meshes.clear();
    },
  };
}

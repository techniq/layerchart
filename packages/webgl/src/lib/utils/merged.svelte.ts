import { untrack } from 'svelte';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LessDepth,
  Mesh,
  MeshLambertMaterial,
} from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { getChartContext } from 'layerchart';

import {
  getSceneContext,
  groupOpacity,
  hasEvents,
  type MarkEvents,
} from '../contexts/scene.svelte.js';

/** One shape of a mark drawn as a single merged mesh: its geometry, outlines, and colors */
export type MergedItem = {
  d: any;
  geometry: BufferGeometry | null;
  /** A CSS color, or `null` for none */
  fill: string | null;
  /** An already resolved fill (linear RGB and alpha), in place of `fill` (ex. while easing) */
  fillColor?: [r: number, g: number, b: number, a: number];
  /** Outline polylines, in the scene's axes, drawn in `stroke` */
  lines?: number[][];
  stroke?: string | null;
};

type MergedOptions = {
  items: () => MergedItem[];
  /** Whether hovering shows the tooltip (only marks that ask are picked) */
  tooltip?: () => boolean;
  /** Pointer handlers, called with the row under the pointer (as the core marks' `onclick`, ...) */
  events?: () => MarkEvents | undefined;
  opacity: () => number;
  /** Multiplies the outlines' alpha (the fills' is `opacity`) */
  lineOpacity?: () => number;
  strokeWidth: () => number;
  /** Lose to other shapes in the same place (ex. an arc's track, beneath the arc) */
  behind?: boolean;
  /**
   * Dash the outlines, as the core marks' `dashArray` (a dash length, `[dash, gap]`, or an SVG
   * `stroke-dasharray` string), in pixels
   */
  dash?: () => number | number[] | string | undefined;
  /**
   * Fill each pixel once, however many of its shapes overlap there, as SVG fills one path (ex. a
   * trail's overlapping pieces, translucent): for a mark whose shapes are one path's
   */
  once?: boolean;
};

const highlight = new Color(0xffffff);

/** `target.push(...source)`, without spreading — big maps outgrow the call stack */
function append(target: number[], source: ArrayLike<number>) {
  for (let i = 0; i < source.length; i++) target.push(source[i]);
}

/**
 * Draws a mark's shapes (map features, polygons, arcs) as one mesh, and their outlines as one set
 * of lines, so thousands of shapes cost a draw call or two.  Picks rows for the tooltip from the
 * face hit, and lightens the hovered shape.  Call during component setup.
 */
export function createMerged({
  items,
  opacity,
  lineOpacity,
  strokeWidth,
  tooltip,
  events,
  behind,
  dash,
  once,
}: MergedOptions) {
  const ctx = getChartContext();
  const scene = getSceneContext();
  /** The `Group`s it's in dim it, as an SVG `<g>`'s opacity does */
  const inGroup = groupOpacity();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();

  const material = new MeshLambertMaterial({
    vertexColors: true,
    side: DoubleSide,
    ...(behind && { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    // Coplanar overlaps fail the depth test after the first, so they blend once
    ...(once && { depthFunc: LessDepth }),
  });
  const mesh = new Mesh(new BufferGeometry(), material);
  mesh.castShadow = mesh.receiveShadow = true;
  const lineMaterial = new LineMaterial({ vertexColors: true, transparent: true });
  const lines = new LineSegments2(new LineSegmentsGeometry(), lineMaterial);
  layer.add(mesh, lines);

  /** Each item's row and the vertices it spans, to pick and to highlight */
  let spans: { d: any; start: number; count: number; color: [number, number, number, number] }[] =
    [];
  let shown: any[] = [];
  const index = new Map<any, number>();
  let emphasized = -1;

  function paint(colors: Float32BufferAttribute, i: number, hovered: boolean) {
    const span = spans[i];
    const [r, g, b, a] = span.color;
    const c = new Color(r, g, b);
    if (hovered) c.lerp(highlight, 0.3);
    for (let v = span.start; v < span.start + span.count; v++) colors.setXYZW(v, c.r, c.g, c.b, a);
  }

  $effect(() => {
    const list = items();
    shown = list;
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    spans = [];
    index.clear();
    let translucent = false;
    /** Outlines share one material, so they take the first one's alpha */
    let strokeAlpha: number | null = null;

    list.forEach((item, i) => {
      index.set(item.d, i);
      const start = positions.length / 3;
      const fill = item.fillColor
        ? { color: new Color(...item.fillColor.slice(0, 3)), opacity: item.fillColor[3] }
        : item.fill
          ? scene.color(item.fill)
          : null;
      const color: [number, number, number, number] = [
        fill?.color.r ?? 0.5,
        fill?.color.g ?? 0.5,
        fill?.color.b ?? 0.5,
        fill?.opacity ?? 1,
      ];
      if (color[3] < 1) translucent = true;
      if (item.geometry && fill) {
        const geometry = item.geometry.index ? item.geometry.toNonIndexed() : item.geometry;
        append(positions, geometry.getAttribute('position').array);
        append(normals, geometry.getAttribute('normal').array);
        if (geometry !== item.geometry) geometry.dispose();
      }
      item.geometry?.dispose();
      const count = positions.length / 3 - start;
      for (let v = 0; v < count; v++) colors.push(...color);
      spans.push({ d: item.d, start, count, color });

      const stroke = item.stroke ? scene.color(item.stroke) : null;
      if (stroke && item.lines) {
        strokeAlpha ??= stroke.opacity;
        for (const line of item.lines) {
          const { r, g, b } = stroke.color;
          for (let k = 0; k + 5 < line.length; k += 3) {
            for (let m = 0; m < 6; m++) linePositions.push(line[k + m]);
            lineColors.push(r, g, b, r, g, b);
          }
        }
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
    mesh.geometry.dispose();
    mesh.geometry = geometry;

    const lineGeometry = new LineSegmentsGeometry();
    if (linePositions.length) {
      lineGeometry.setPositions(linePositions);
      lineGeometry.setColors(lineColors);
    }
    lines.geometry.dispose();
    lines.geometry = lineGeometry;
    lines.visible = linePositions.length > 0;
    // Along each outline, for its dashes
    if (lineMaterial.dashed && linePositions.length) lines.computeLineDistances();
    lineMaterial.opacity = (strokeAlpha ?? 1) * (lineOpacity?.() ?? 1) * inGroup();

    // Rebuilt without emphasis, so put back whatever's hovered
    emphasized = -1;
    const hovered = untrack(() => ctx.tooltip.data);
    const hoveredIndex = hovered == null ? -1 : (index.get(hovered) ?? -1);
    if (hoveredIndex >= 0) {
      paint(geometry.getAttribute('color') as Float32BufferAttribute, hoveredIndex, true);
      emphasized = hoveredIndex;
    }

    const o = opacity() * inGroup();
    material.opacity = o;
    if (material.transparent !== (translucent || o < 1)) {
      material.transparent = translucent || o < 1;
      material.needsUpdate = true;
    }
    scene.invalidate();
  });

  $effect(() => {
    lineMaterial.linewidth = strokeWidth();
    scene.invalidate();
  });

  // Dashes, as an SVG `stroke-dasharray` (the first dash and gap), the same on screen at any depth
  if (dash) {
    $effect(() => {
      const pattern = dashPattern(dash());
      const dashed = pattern != null;
      if (lineMaterial.dashed !== dashed) {
        lineMaterial.dashed = dashed;
        lineMaterial.needsUpdate = true;
        if (dashed && lines.visible) lines.computeLineDistances();
      }
      if (pattern) {
        lineMaterial.dashSize = pattern[0] * scene.unit;
        lineMaterial.gapSize = pattern[1] * scene.unit;
      }
      scene.invalidate();
    });
  }

  $effect(() => {
    const hovered = ctx.tooltip.data;
    untrack(() => {
      const next = hovered == null ? -1 : (index.get(hovered) ?? -1);
      if (next === emphasized) return;
      const colors = mesh.geometry.getAttribute('color') as Float32BufferAttribute | undefined;
      if (!colors) return;
      if (emphasized >= 0 && emphasized < spans.length) paint(colors, emphasized, false);
      if (next >= 0) paint(colors, next, true);
      emphasized = next;
      colors.needsUpdate = true;
      scene.invalidate();
    });
  });

  $effect(() => {
    const shows = !!tooltip?.();
    if (!shows && !hasEvents(events?.())) return;
    return scene.addPickable({
      tooltip: () => shows,
      events,
      object: mesh,
      datum: (hit) => {
        const vertex = hit.face?.a;
        if (vertex == null) return undefined;
        // The spans are in order, so search for the one holding the vertex
        let lo = 0;
        let hi = spans.length - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const span = spans[mid];
          if (vertex < span.start) hi = mid - 1;
          else if (vertex >= span.start + span.count) lo = mid + 1;
          else return shown[mid]?.d;
        }
        return undefined;
      },
    });
  });

  $effect(() => {
    return () => {
      layer.remove(mesh, lines);
      mesh.geometry.dispose();
      lines.geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      scene.invalidate();
    };
  });
}

/**
 * A `dashArray` (as the core marks take it: a length, a `[dash, gap, ...]` array, or an SVG
 * `stroke-dasharray` string) as a dash and gap, or `null` for a solid line
 */
export function dashPattern(
  dashArray: number | number[] | string | undefined | null
): [number, number] | null {
  if (dashArray == null || dashArray === '' || dashArray === 'none') return null;
  const values =
    typeof dashArray === 'number'
      ? [dashArray]
      : typeof dashArray === 'string'
        ? dashArray.split(/[\s,]+/).map(Number)
        : dashArray;
  const [first, second = first] = values.filter((v) => Number.isFinite(v) && v >= 0);
  return first > 0 ? [first, second] : null;
}

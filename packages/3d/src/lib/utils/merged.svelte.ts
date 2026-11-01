import { untrack } from 'svelte';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshLambertMaterial,
} from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { getChartContext } from 'layerchart';

import { getSceneContext } from '../contexts/scene.svelte.js';

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
  opacity: () => number;
  strokeWidth: () => number;
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
export function createMerged({ items, opacity, strokeWidth, tooltip }: MergedOptions) {
  const ctx = getChartContext();
  const scene = getSceneContext();

  const material = new MeshLambertMaterial({ vertexColors: true, side: DoubleSide });
  const mesh = new Mesh(new BufferGeometry(), material);
  mesh.castShadow = mesh.receiveShadow = true;
  const lineMaterial = new LineMaterial({ vertexColors: true, transparent: true });
  const lines = new LineSegments2(new LineSegmentsGeometry(), lineMaterial);
  scene.root.add(mesh, lines);

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
    lineMaterial.opacity = strokeAlpha ?? 1;

    // Rebuilt without emphasis, so put back whatever's hovered
    emphasized = -1;
    const hovered = untrack(() => ctx.tooltip.data);
    const hoveredIndex = hovered == null ? -1 : (index.get(hovered) ?? -1);
    if (hoveredIndex >= 0) {
      paint(geometry.getAttribute('color') as Float32BufferAttribute, hoveredIndex, true);
      emphasized = hoveredIndex;
    }

    const o = opacity();
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
    if (!tooltip?.()) return;
    return scene.addPickable({
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
      scene.root.remove(mesh, lines);
      mesh.geometry.dispose();
      lines.geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      scene.invalidate();
    };
  });
}

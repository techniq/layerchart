<!-- Every cell of a `Bin`'s grid outlined beneath its cells, clipped to the plot, as the core `Bin`'s `grid` -->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Group } from 'three';
  import type { LineMaterial } from 'three/addons/lines/LineMaterial.js';
  import { binGrid, getChartContext, type BinShape } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createSegments } from '../../utils/lines.js';
  import type { BinGridProps } from './Bin.shared.svelte.js';

  let {
    shape,
    size,
    grid,
    layer: layerProp,
  }: {
    shape: BinShape;
    size: number;
    /** How to draw it: `true`, or its stroke, width, opacity, and classes */
    grid: BinGridProps;
    /** The group to draw into, beneath the cells (else one of its own) */
    layer?: Group | null;
  } = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  // Fixed as it mounts
  const layer = untrack(() => layerProp) ?? scene.layer();
  const options = $derived(typeof grid === 'object' ? grid : {});
  /** What its `class` and `style` set */
  const look = $derived(
    scene.style(options.class, options.style ? { style: options.style } : undefined)
  );

  /** A little above the floor, beneath the cells' prisms */
  const LIFT = 0.05;

  const lines = createSegments();
  // Under the marks wherever they meet
  lines.object.renderOrder = -1;
  layer.add(lines.object);

  /** The part of the segment from `a` to `b` inside `[0, w] × [0, h]`, or `null` (Liang–Barsky) */
  function clip(
    [ax, ay]: [number, number],
    [bx, by]: [number, number],
    w: number,
    h: number
  ): [number, number, number, number] | null {
    const dx = bx - ax;
    const dy = by - ay;
    let t0 = 0;
    let t1 = 1;
    for (const [p, q] of [
      [-dx, ax],
      [dx, w - ax],
      [-dy, ay],
      [dy, h - ay],
    ]) {
      if (p === 0) {
        if (q < 0) return null;
      } else {
        const t = q / p;
        if (p < 0) t0 = Math.max(t0, t);
        else t1 = Math.min(t1, t);
      }
    }
    return t0 > t1 ? null : [ax + t0 * dx, ay + t0 * dy, ax + t1 * dx, ay + t1 * dy];
  }

  $effect(() => {
    const w = ctx.width;
    const h = ctx.height;
    const segments: number[] = [];
    if (w > 0 && h > 0 && size > 0) {
      // Measured against an isometric floor laid flat, as the cells are
      const cells = binGrid(shape, size, ctx.floorScale);
      // Each edge once, where two cells share it, so a translucent stroke doesn't darken there
      const seen = new Set<string>();
      const round = (v: number) => Math.round(v * 100);
      for (const cell of cells.cover(w, h)) {
        const corners = cells.polygon(cell.x, cell.y, cell.up);
        corners.forEach((a, i) => {
          const b = corners[(i + 1) % corners.length];
          const [p, q] = [a, b].map(([x, y]) => `${round(x)},${round(y)}`).sort();
          const key = `${p}:${q}`;
          if (seen.has(key)) return;
          seen.add(key);
          const part = clip(a, b, w, h);
          if (part) segments.push(part[0], LIFT, part[1], part[2], LIFT, part[3]);
        });
      }
    }
    lines.set(segments);
    scene.invalidate();
  });

  $effect(() => {
    // As the core `Bin`'s grid: a faint line in the surface's content color
    const color = scene.color(
      options.stroke ??
        look?.stroke ??
        'color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent)'
    );
    lines.style(color, options.strokeWidth ?? look?.strokeWidth ?? 1);
    (lines.object.material as LineMaterial).opacity =
      (color?.opacity ?? 1) *
      (options.opacity ?? 1) *
      (options.strokeOpacity ?? 1) *
      (look?.opacity ?? 1);
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      layer.remove(lines.object);
      lines.dispose();
      scene.invalidate();
    };
  });
</script>

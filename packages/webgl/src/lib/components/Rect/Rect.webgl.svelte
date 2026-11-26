<script lang="ts" module>
  import type { RectProps } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { BoxGeometry, Color } from 'three';
  import { createDataMotionMap } from 'layerchart/utils/motion.svelte';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isDataProp, resolveDataProp } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
  import { createOutlines } from '../../utils/outlines.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';

  let {
    data,
    x,
    y,
    width,
    height,
    x0,
    x1,
    y0,
    y1,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    tooltip = false,
    motion,
    key = (_d: any, i: number) => i,
  }: RectProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);
  const highlight = new Color(0xffffff);

  /** With rows (`data`, or props reading the chart's), as the core `Rect` */
  const dataMode = $derived(
    data != null || [x, y, width, height, x0, x1, y0, y1].some((p) => isDataProp(p))
  );
  const edges = $derived(x0 != null || x1 != null || y0 != null || y1 != null);

  /** The box's footprint on the floor, in pixels */
  function footprint(d: any) {
    if (edges) {
      const [left, top] = positionOf(ctx, x0, y0, d, { bandStart: true });
      const [right, bottom] = positionOf(ctx, x1, y1, d, { bandStart: true });
      return {
        x: Math.min(left, right),
        y: Math.min(top, bottom),
        width: Math.abs(right - left),
        depth: Math.abs(bottom - top),
      };
    }
    const [px, py] = positionOf(ctx, x, y, d, { bandStart: true });
    return {
      x: px,
      y: py,
      width: resolveDataProp(width, d, undefined, 0),
      depth: resolveDataProp(height, d, undefined, 0),
    };
  }

  /** The box's base and top heights, in pixels */
  function heights(d: any): [number, number] {
    if (z == null) return dataMode && ctx.config.z != null ? ctx.heightOf(d) : [0, 0.3];
    if (typeof z === 'function') {
      const value = z(d);
      if (Array.isArray(value)) {
        const [a, b] = value.map((v) => Number(ctx.zScale(v)) || 0);
        return [Math.min(a, b), Math.max(a, b)];
      }
    }
    const [a, b] = ctx.heightOf(d, z);
    return [Math.min(a, b), Math.max(a, b)];
  }

  /** Each row's box as asked: its corner, size, and color */
  const targets = $derived(
    (dataMode ? markRows(ctx, data, x, y, width, height, x0, x1, y0, y1) : [undefined]).map((d, i) => {
      const [base, top] = heights(d);
      return {
        d,
        key: key(d, i),
        ...footprint(d),
        z: base,
        height: top - base,
        color: rowColor(
          ctx,
          fill ?? undefined,
          d,
          'var(--color-surface-content, currentColor)',
          look?.fill
        ),
      };
    })
  );

  // Easing to where they're asked to be, as the core `Rect` (ex. a highlight's band springing
  // from row to row), each by its `key`
  const motionMap = createDataMotionMap(untrack(() => motion));
  if (motionMap) {
    $effect(() => {
      const active = new Set<unknown>();
      for (const t of targets) {
        active.add(t.key);
        untrack(() =>
          motionMap.update(t.key, {
            x: t.x,
            y: t.y,
            width: t.width,
            depth: t.depth,
            z: t.z,
            height: t.height,
          })
        );
      }
      untrack(() => motionMap.cleanup(active));
    });
  }

  /** Each row's box where it is now */
  const boxes = $derived(
    targets.map((t) => {
      const now = motionMap?.get(t.key);
      return now ? { ...t, ...now } : t;
    })
  );

  /** No box for a `none` fill (ex. `class="fill-none"`), only its outline */
  const filled = $derived(
    fill !== null && fill !== 'none' && !(fill == null && look?.fill === 'none')
  );

  /** Outlined only when asked, so boxes without one cost nothing more */
  const outlined = $derived(stroke != null || !!look?.stroke);

  // A unit cube standing on its corner at the origin, so each box scales out from `(x, y)` up
  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => (filled ? boxes : []),
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
    // Giving way to its outline in depth, so the outline sits on its edges
    behind: () => outlined,
  });

  // Around each box's top and up its corners, as the core isometric boxes are outlined
  createOutlines({
    instances: () => (outlined ? boxes : []),
    stroke: (d) => rowColor(ctx, stroke, d, 'currentColor', look?.stroke),
    strokeWidth: () => strokeWidth,
    opacity: () => opacity * (look?.opacity ?? 1),
  });
</script>

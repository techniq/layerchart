<script lang="ts" module>
  import type { RectProps } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import { BoxGeometry, Color } from 'three';
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

  /** Each row's box: its corner, size, and color */
  const boxes = $derived(
    (dataMode ? markRows(ctx, data, x, y, width, height, x0, x1, y0, y1) : [undefined]).map((d) => {
      const [base, top] = heights(d);
      return {
        d,
        ...footprint(d),
        z: base,
        height: top - base,
        color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)', look?.fill),
      };
    })
  );

  /** Outlined only when asked, so boxes without one cost nothing more */
  const outlined = $derived(stroke != null || !!look?.stroke);

  // A unit cube standing on its corner at the origin, so each box scales out from `(x, y)` up
  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () => boxes,
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

<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';

  export type RectProps = {
    /** Rows to draw a box each for.  Falls back to the chart's data when the props read rows. */
    data?: any[];
    /**
     * Left edge: a data property name or function of the row through the chart's `x` scale, or
     * pixels
     */
    x?: DataProp;
    /**
     * Top edge (its far side, before the view turns): a data property name or function of the
     * row through the chart's `y` scale, or pixels
     */
    y?: DataProp;
    /** Width across `x`, in pixels: a number, data property name, or function of the row */
    width?: DataProp;
    /** Depth down `y`, in pixels: a number, data property name, or function of the row */
    height?: DataProp;
    /** One side across `x`, as `x` (with `x1`, rather than `x` and `width`) */
    x0?: DataProp;
    /** The other side across `x`, as `x` */
    x1?: DataProp;
    /** One side down `y`, as `y` (with `y1`, rather than `y` and `height`) */
    y0?: DataProp;
    /** The other side down `y`, as `y` */
    y1?: DataProp;
    /**
     * How tall each box stands: a data property name or function of the row through the chart's
     * `z` scale (a function can return `[start, end]` to float the box between them), pixels, or
     * a `[start, end]` pair of pixels.  Defaults to the chart's `z` with rows, else a thin tile.
     */
    z?: DataProp | [start: number, end: number];
    /**
     * A CSS color, or a key / function of the row run through the chart's color scale.
     *
     * @default 'var(--color-primary)'
     */
    fill?: ColorProp;
    /**
     * CSS classes to style it by, as LayerChart's marks take them (ex. `fill-red-500 opacity-50`):
     * the fill, stroke, stroke width, and opacity they set, where its props don't say
     */
    class?: string;
    /** @default 1 */
    opacity?: number;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import { BoxGeometry, Color } from 'three';
  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { getChartContext, isDataProp, resolveDataProp } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
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
    class: className,
    opacity = 1,
    tooltip = false,
  }: RectProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets */
  const look = $derived(scene.style(className));
  const highlight = new Color(0xffffff);

  /** With rows (`data`, or props reading the chart's), as LayerChart's `Rect` */
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

  // A unit cube standing on its corner at the origin, so each box scales out from `(x, y)` up
  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () =>
      (dataMode ? markRows(ctx, data, x, y, width, height, x0, x1, y0, y1) : [undefined]).map(
        (d) => {
          const [base, top] = heights(d);
          return {
            d,
            ...footprint(d),
            z: base,
            height: top - base,
            color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)', look?.fill),
          };
        }
      ),
    opacity: () => opacity * (look?.opacity ?? 1),
    emphasize: (color) => color.lerp(highlight, 0.25),
  });
</script>

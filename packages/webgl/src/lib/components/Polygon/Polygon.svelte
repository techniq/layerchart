<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';

  export type PolygonProps = {
    /** Rows to draw a polygon each for.  Falls back to the chart's data when the props read rows. */
    data?: any[];
    /**
     * Center across: a data property name or function of the row through the chart's `x` scale
     * (or longitude, through its projection), or pixels
     */
    cx?: DataProp;
    /**
     * Center down: a data property name or function of the row through the chart's `y` scale (or
     * latitude, through its projection), or pixels
     */
    cy?: DataProp;
    /**
     * Radius: a data property name or function of the row through the chart's `r` scale, or
     * pixels.
     *
     * @default 1
     */
    r?: DataProp;
    /**
     * The number of corners of a regular polygon about `cx` / `cy`, or the corners themselves, in
     * pixels.
     *
     * @default 4
     */
    points?: number | { x: number; y: number }[];
    /** The radius of the curve for rounded corners. @default 0 */
    cornerRadius?: number;
    /** The rotation of the polygon, in degrees. @default 0 */
    rotate?: number;
    /** The percent to inset the odd points of the star (<1 inset, >1 outset). @default 0 */
    inset?: number;
    /** The horizontal stretch factor of the polygon. @default 1 */
    scaleX?: number;
    /** The vertical stretch factor of the polygon. @default 1 */
    scaleY?: number;
    /** The skew angle in degrees along the X axis. @default 0 */
    skewX?: number;
    /** The skew angle in degrees along the Y axis. @default 0 */
    skewY?: number;
    /** The tilt factor for x-coordinates. @default 0 */
    tiltX?: number;
    /** The tilt factor for y-coordinates. @default 0 */
    tiltY?: number;
    /**
     * How tall it stands, as LayerChart's `Polygon` on an `isometric` chart: a data property name
     * or function of the row through the chart's `z` scale, pixels, or a `[start, end]` pair of
     * pixels to float it between.  Defaults to the chart's `z` with rows, else it lies flat.
     */
    z?: DataProp | [start: number, end: number];
    /**
     * A CSS color, or a key / function of the row run through the chart's color scale.
     *
     * @default 'var(--color-primary)'
     */
    fill?: ColorProp;
    /** The outline: a CSS color, or a key / function of the row run through the color scale */
    stroke?: ColorProp;
    /** @default 1 */
    strokeWidth?: number;
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
  import { getChartContext, hasAnyDataProp, resolveDataProp } from 'layerchart';
  import { polygon } from 'layerchart/utils/shape';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { markRows, positionOf, rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';

  let {
    data,
    cx,
    cy,
    r,
    points = 4,
    cornerRadius = 0,
    rotate = 0,
    inset = 0,
    scaleX = 1,
    scaleY = 1,
    skewX = 0,
    skewY = 0,
    tiltX = 0,
    tiltY = 0,
    z,
    fill,
    stroke,
    strokeWidth: strokeWidthProp,
    class: className,
    opacity = 1,
    tooltip = false,
  }: PolygonProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  /** What its `class` sets, where its props don't say */
  const look = $derived(scene.style(className));
  const strokeWidth = $derived(strokeWidthProp ?? look?.strokeWidth ?? 1);

  /** Whether the props read rows, as LayerChart's `Polygon` decides */
  const dataMode = $derived(hasAnyDataProp(cx, cy, r));

  /** A row's corners, in pixels */
  function corners(d: any): { x: number; y: number }[] {
    if (typeof points !== 'number') return points;
    const [x, y] = positionOf(ctx, cx, cy, d);
    const radius = resolveDataProp(r, d, ctx.rScale, typeof r === 'number' ? r : 1);
    return polygon({
      cx: x,
      cy: y,
      count: points,
      radius,
      rotate,
      inset,
      scaleX,
      scaleY,
      skewX,
      skewY,
      tiltX,
      tiltY,
    });
  }

  /** `corners` traced into `context`, each corner rounded by `cornerRadius` (as LayerChart's) */
  function trace(context: ShapeContext, coords: { x: number; y: number }[]) {
    if (!coords.length) return;
    if (!cornerRadius) {
      coords.forEach(({ x, y }, i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
      return;
    }
    const n = coords.length;
    for (let i = 0; i <= n; i++) {
      const a = coords[i % n];
      const b = coords[(i + 1) % n];
      const t = Math.min(cornerRadius / Math.hypot(b.x - a.x, b.y - a.y), 0.5);
      const near = [a.x * (1 - t) + b.x * t, a.y * (1 - t) + b.y * t] as const;
      if (i === 0) context.moveTo(...near);
      else context.quadraticCurveTo(a.x, a.y, ...near);
      if (i < n) context.lineTo(a.x * t + b.x * (1 - t), a.y * t + b.y * (1 - t));
    }
    context.closePath();
  }

  /** A polygon's base and top heights, in pixels: flat (`[0, 0]`) without any */
  function heights(d: any): [number, number] {
    let pair: [number, number];
    if (Array.isArray(z)) pair = z;
    else if (z != null) {
      pair = dataMode ? ctx.heightOf(d, z) : typeof z === 'number' ? [0, z] : [0, 0];
    } else pair = dataMode && ctx.config.z != null ? ctx.heightOf(d) : [0, 0];
    return [Math.min(...pair), Math.max(...pair)];
  }

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (dataMode ? markRows(ctx, data, cx, cy, r) : [undefined]).map((d) => {
        const context = new ShapeContext();
        trace(context, corners(d));
        const [base, top] = heights(d);
        // Lying flat, just above the floor (and its grid)
        const [z0, z1] = top - base > 0.01 ? [base, top] : [base + 0.3, base + 0.3];
        const outline = z1 + 0.5;
        return {
          d,
          geometry: (fill ?? look?.fill) === 'none' ? null : extrude(context, z0, z1),
          fill: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)', look?.fill),
          lines: context.lines.map((line) => line.flatMap(([x, y]) => [x, outline, y])),
          stroke:
            stroke == null && !look?.stroke
              ? null
              : rowColor(ctx, stroke, d, 'currentColor', look?.stroke),
        };
      }),
    opacity: () => opacity * (look?.opacity ?? 1),
    strokeWidth: () => strokeWidth,
  });
</script>

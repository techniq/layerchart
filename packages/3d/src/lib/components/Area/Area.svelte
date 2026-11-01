<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';

  export type AreaProps = {
    /** Override the chart's `data` */
    data?: any[];
    /** Override the chart's `x` accessor */
    x?: Accessor;
    /** Override the chart's `y` accessor */
    y?: Accessor;
    /**
     * The top: a key or function of the row (through the chart's `z` scale), or a number of
     * pixels.  Defaults to the chart's `z`.
     */
    z?: DataProp;
    /**
     * The base, likewise.
     *
     * @default 0 (the floor)
     */
    z0?: DataProp;
    /**
     * Draw one area per distinct value, in data order.  Defaults to the chart's `g`, else the
     * data key `fill` names, else the chart's `c` (as `Spline`).
     */
    g?: Accessor;
    /**
     * A CSS color, or a data key / function run through the chart's color scale (read from each
     * area's first row).  Defaults to the chart's `c`, else `var(--color-primary)`.
     */
    fill?: ColorProp;
    /**
     * Opacity of the area (its top line stays solid).
     *
     * @default 0.6
     */
    opacity?: number;
    /**
     * Draw a line along the top, in the fill's color.
     *
     * @default true
     */
    line?: boolean;
    /** @default 2 */
    strokeWidth?: number;
    /**
     * Show the tooltip for the row the pointer is over (with the chart's `tooltipContext`).
     *
     * @default false
     */
    tooltip?: boolean;
  };
</script>

<script lang="ts">
  import { group } from 'd3-array';
  import { BufferGeometry, Float32BufferAttribute } from 'three';
  import { accessor, colorPropDataKey, getChartContext, resolveDataProp } from 'layerchart';

  import { createMerged } from '../../utils/merged.svelte.js';
  import { defined, position, resolveAccessor, rowColor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    z0 = 0,
    g,
    fill,
    opacity = 0.6,
    line = true,
    strokeWidth = 2,
    tooltip = false,
  }: AreaProps = $props();

  const ctx = getChartContext();

  ctx.registerComponent({
    name: 'Area',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, x, y, color: typeof fill === 'string' ? fill : undefined }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  /** As `Spline`: what splits the rows into areas */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropDataKey(fill, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (gAccessor ? [...group(rows, gAccessor).values()] : [rows]).map((areaRows) => {
        // A curtain from the base up to the top, through each row in order
        const columns: [number, number, number, number][] = [];
        for (const d of areaRows) {
          const xValue = xAccessor(d);
          const yValue = yAccessor(d);
          if (!defined(xValue) || !defined(yValue)) continue;
          const [px, py] = position(ctx, xValue, yValue);
          const top = ctx.heightOf(d, z)[1];
          const base = resolveDataProp(z0, d, ctx.zScale, 0) as number;
          if ([px, py, top, base].every((v) => Number.isFinite(v)))
            columns.push([px, py, base, top]);
        }
        const positions: number[] = [];
        for (let k = 0; k < columns.length - 1; k++) {
          const [ax, ay, a0, a1] = columns[k];
          const [bx, by, b0, b1] = columns[k + 1];
          positions.push(ax, a0, ay, bx, b0, by, ax, a1, ay, ax, a1, ay, bx, b0, by, bx, b1, by);
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();
        const color = rowColor(ctx, fill, areaRows[0], 'var(--color-primary, currentColor)');
        return {
          d: areaRows[0],
          geometry: positions.length ? geometry : null,
          fill: color,
          lines: line ? [columns.flatMap(([px, py, , top]) => [px, top, py])] : [],
          stroke: line ? color : null,
        };
      }),
    opacity: () => opacity,
    strokeWidth: () => strokeWidth,
  });
</script>

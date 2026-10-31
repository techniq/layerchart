<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';

  export type SplineProps = {
    /** Override the chart's `data` */
    data?: any[];
    /** Override the chart's `x` accessor */
    x?: Accessor;
    /** Override the chart's `y` accessor */
    y?: Accessor;
    /**
     * Height off the floor: a data key or function (through the chart's `z` scale), or a number
     * of pixels.  Defaults to the chart's `z`.
     */
    z?: DataProp;
    /**
     * Draw one line per distinct value, in data order.  Defaults to the chart's `g`, else the
     * data key `stroke` names, else the chart's `c` (as LayerChart's `Spline`).
     */
    g?: Accessor;
    /**
     * A CSS color, or a data key / function run through the chart's color scale (read from each
     * line's first row).  Defaults to the chart's `c`, else `var(--color-primary, currentColor)`.
     */
    stroke?: ColorProp;
    /**
     * Line width in pixels, the same at any depth.
     *
     * @default 2
     */
    strokeWidth?: number;
    /** @default 1 */
    opacity?: number;
  };
</script>

<script lang="ts">
  import { Line2 } from 'three/addons/lines/Line2.js';
  import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
  import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
  import { group } from 'd3-array';
  import { accessor, colorPropDataKey, getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { defined, resolveAccessor, rowColor, scaled } from '../../utils/marks.js';

  let { data: dataProp, x, y, z, g, stroke, strokeWidth = 2, opacity = 1 }: SplineProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  ctx.registerComponent({
    name: 'Spline',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      color: typeof stroke === 'string' ? stroke : undefined,
    }),
  });

  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));
  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);

  /**
   * What splits the rows into lines: this mark's `g`, the chart's `g`, the data key `stroke`
   * names, then the chart's `c` — what colors the lines splits them.  Rows the mark was handed
   * itself are taken as already grouped.
   */
  const gAccessor = $derived.by<((d: any) => unknown) | null>(() => {
    const gProp = g ?? (ctx.props as { g?: Accessor }).g;
    if (gProp != null) return accessor(gProp);
    const first = rows[0];
    const implied = colorPropDataKey(stroke, first);
    if (implied != null) return accessor(implied);
    if (dataProp != null) return null;
    return first != null && ctx.cKey(first) != null ? ctx.cKey : null;
  });

  const lines = $derived(
    (gAccessor ? [...group(rows, gAccessor).values()] : [rows])
      .map((lineRows) => {
        const positions: number[] = [];
        for (const d of lineRows) {
          const xValue = xAccessor(d);
          const yValue = yAccessor(d);
          if (!defined(xValue) || !defined(yValue)) continue;
          const point = [
            scaled(ctx.xScale, xValue),
            ctx.config.z != null || z != null ? ctx.heightOf(d, z)[1] : 0,
            scaled(ctx.yScale, yValue),
          ];
          // Out of a scale's domain, a position is `NaN`
          if (point.every((v) => Number.isFinite(v))) positions.push(...point);
        }
        return {
          positions,
          color: rowColor(ctx, stroke, lineRows[0], 'var(--color-primary, currentColor)'),
        };
      })
      .filter((line) => line.positions.length >= 6)
  );

  $effect(() => {
    const objects = lines.map(({ positions, color }) => {
      const geometry = new LineGeometry();
      geometry.setPositions(positions);
      const resolved = scene.color(color);
      const material = new LineMaterial({
        color: resolved?.color ?? 0x888888,
        linewidth: strokeWidth,
        transparent: opacity < 1 || (resolved?.opacity ?? 1) < 1,
        opacity: opacity * (resolved?.opacity ?? 1),
      });
      const line = new Line2(geometry, material);
      scene.root.add(line);
      return line;
    });
    scene.invalidate();

    return () => {
      for (const line of objects) {
        scene.root.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      }
      scene.invalidate();
    };
  });
</script>

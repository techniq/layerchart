<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';
  import type { ValueProp } from '../../utils/values.js';

  export type ArcProps = {
    /** Rows to draw an arc each for (ex. from `d3.pie()`).  Without them, one arc. */
    data?: any[];
    /**
     * Where it starts, in radians clockwise from the top of the plot (its far edge before the
     * view turns), or a function of the row.
     *
     * @default (d) => d.startAngle
     */
    startAngle?: ValueProp<number>;
    /** @default (d) => d.endAngle */
    endAngle?: ValueProp<number>;
    /** @default 0 */
    innerRadius?: ValueProp<number>;
    /** Defaults to fill the plot */
    outerRadius?: ValueProp<number>;
    /** @default 0 */
    padAngle?: ValueProp<number>;
    /** @default 0 */
    cornerRadius?: ValueProp<number>;
    /** The center, in pixels.  Defaults to the plot's center. */
    x?: number;
    /** The center, in pixels.  Defaults to the plot's center. */
    y?: number;
    /**
     * How tall it stands: a key or function of the row (through the chart's `z` scale), or a
     * number of pixels.  Flat on the floor without one.
     */
    z?: DataProp;
    /**
     * A CSS color, or a key / function of the row run through the chart's color scale.
     *
     * @default 'var(--color-primary)'
     */
    fill?: ColorProp;
    /** The outline's CSS color, or a function of the row.  No outline without one. */
    stroke?: ValueProp<string | null | undefined>;
    /** @default 1 */
    strokeWidth?: number;
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
  import { arc as d3Arc } from 'd3-shape';
  import { getChartContext } from 'layerchart';

  import { createMerged } from '../../utils/merged.svelte.js';
  import { rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    startAngle = (d: any) => d.startAngle,
    endAngle = (d: any) => d.endAngle,
    innerRadius = 0,
    outerRadius,
    padAngle = 0,
    cornerRadius = 0,
    x,
    y,
    z,
    fill,
    stroke,
    strokeWidth = 1,
    opacity = 1,
    tooltip = false,
  }: ArcProps = $props();

  const ctx = getChartContext();

  createMerged({
    tooltip: () => tooltip,
    items: () => {
      const cx = x ?? ctx.width / 2;
      const cy = y ?? ctx.height / 2;
      return (data ?? [undefined]).map((d) => {
        const context = new ShapeContext();
        // `d3.arc` measures clockwise from 12 o'clock, around `(0, 0)`
        const shape = d3Arc<any>()
          .startAngle(valueOf(startAngle, d))
          .endAngle(valueOf(endAngle, d))
          .innerRadius(valueOf(innerRadius, d))
          .outerRadius(
            outerRadius == null ? Math.min(ctx.width, ctx.height) / 2 : valueOf(outerRadius, d)
          )
          .padAngle(valueOf(padAngle, d))
          .cornerRadius(valueOf(cornerRadius, d))
          .context({
            moveTo: (px: number, py: number) => context.moveTo(cx + px, cy + py),
            lineTo: (px: number, py: number) => context.lineTo(cx + px, cy + py),
            arc: (px: number, py: number, r: number, a0: number, a1: number, ccw?: boolean) =>
              context.arc(cx + px, cy + py, r, a0, a1, ccw),
            closePath: () => context.closePath(),
          } as any);
        shape(d);
        const [z0, z1] = z == null ? [0.3, 0.3] : ctx.heightOf(d, z);
        const top = Math.max(z0, z1) + 0.5;
        return {
          d,
          geometry: extrude(context, z0, z1, 24),
          fill: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
          lines: context.lines.map((line) => line.flatMap(([px, py]) => [px, top, py])),
          stroke: valueOf(stroke, d) ?? null,
        };
      });
    },
    opacity: () => opacity,
    strokeWidth: () => strokeWidth,
  });
</script>

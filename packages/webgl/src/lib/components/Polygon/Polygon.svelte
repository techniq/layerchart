<script lang="ts" module>
  import type { ColorProp, DataProp } from 'layerchart';
  import type { ValueProp } from '../../utils/values.js';

  export type PolygonProps = {
    /** Rows to draw a polygon each for.  Without them, one polygon from `points`. */
    data?: any[];
    /** The corners, as `[x, y]` pixels, or a function of the row returning them */
    points: ValueProp<[number, number][]>;
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
  import { getChartContext } from 'layerchart';

  import { createMerged } from '../../utils/merged.svelte.js';
  import { rowColor } from '../../utils/marks.js';
  import { extrude, ShapeContext } from '../../utils/shapes.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    points,
    z,
    fill,
    stroke,
    strokeWidth = 1,
    opacity = 1,
    tooltip = false,
  }: PolygonProps = $props();

  const ctx = getChartContext();

  createMerged({
    tooltip: () => tooltip,
    items: () =>
      (data ?? [undefined]).map((d) => {
        const corners = valueOf(points, d) ?? [];
        const context = new ShapeContext();
        corners.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
        if (corners.length) context.closePath();
        const [z0, z1] = z == null ? [0.3, 0.3] : ctx.heightOf(d, z);
        const top = Math.max(z0, z1) + 0.5;
        return {
          d,
          geometry: extrude(context, z0, z1),
          fill: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
          lines: context.lines.map((line) => line.flatMap(([x, y]) => [x, top, y])),
          stroke: valueOf(stroke, d) ?? null,
        };
      }),
    opacity: () => opacity,
    strokeWidth: () => strokeWidth,
  });
</script>

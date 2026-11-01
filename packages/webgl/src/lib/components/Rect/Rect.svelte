<script lang="ts" module>
  import type { ColorProp } from 'layerchart';
  import type { ValueProp } from '../../utils/values.js';

  export type RectProps = {
    /** Rows to draw a box each for.  Without them, one box. */
    data?: any[];
    /** Left edge in pixels, or a function of the row */
    x: ValueProp<number>;
    /** Top edge (its far side, before the view turns) in pixels, or a function of the row */
    y: ValueProp<number>;
    /** Width across `x` in pixels, or a function of the row */
    width: ValueProp<number>;
    /** Depth down `y` in pixels, or a function of the row */
    height: ValueProp<number>;
    /**
     * Height in pixels, or a `[base, top]` pair to float the box, or a function of the row
     * returning either.  Flat on the floor without one.
     */
    z?: ValueProp<number | [number, number]>;
    /**
     * A CSS color, or a key / function of the row run through the chart's color scale.
     *
     * @default 'var(--color-primary)'
     */
    fill?: ColorProp;
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
  import { getChartContext } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
  import { rowColor } from '../../utils/marks.js';
  import { heights, valueOf } from '../../utils/values.js';

  let {
    data,
    x,
    y,
    width,
    height,
    z = 0.3,
    fill,
    opacity = 1,
    tooltip = false,
  }: RectProps = $props();

  const ctx = getChartContext();
  const highlight = new Color(0xffffff);

  // A unit cube standing on its corner at the origin, so each box scales out from `(x, y)` up
  createInstances({
    tooltip: () => tooltip,
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () =>
      (data ?? [undefined]).map((d) => {
        const [z0, z1] = heights(valueOf(z, d));
        return {
          d,
          x: valueOf(x, d),
          y: valueOf(y, d),
          z: z0,
          width: valueOf(width, d),
          depth: valueOf(height, d),
          height: z1 - z0,
          color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
        };
      }),
    opacity: () => opacity,
    emphasize: (color) => color.lerp(highlight, 0.25),
  });
</script>

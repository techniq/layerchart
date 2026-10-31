<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';

  export type PointsProps = {
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
     * Radius in pixels, or per row.  Defaults to the chart's `r` scale when it has one, else `5`.
     */
    r?: number | ((d: any) => number);
    /**
     * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
     * chart's `c`, else `var(--color-primary, currentColor)`.
     */
    fill?: ColorProp;
    /** @default 1 */
    opacity?: number;
    /**
     * Scale of the hovered point.
     *
     * @default 1.4
     */
    hoverScale?: number;
  };
</script>

<script lang="ts">
  import { SphereGeometry } from 'three';
  import { getChartContext } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
  import { defined, resolveAccessor, rowColor, scaled } from '../../utils/marks.js';

  let { data: dataProp, x, y, z, r, fill, opacity = 1, hoverScale = 1.4 }: PointsProps = $props();

  const ctx = getChartContext();

  ctx.registerComponent({
    name: 'Points',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, x, y, color: typeof fill === 'string' ? fill : undefined }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  // A unit sphere, scaled out to each point's radius about its center
  createInstances({
    geometry: new SphereGeometry(1, 24, 16),
    instances: () =>
      rows.flatMap((d: any) => {
        const xValue = xAccessor(d);
        const yValue = yAccessor(d);
        if (!defined(xValue) || !defined(yValue)) return [];
        const radius = typeof r === 'function' ? r(d) : (r ?? (ctx.config.r ? ctx.rGet(d) : 5));
        return [
          {
            d,
            x: scaled(ctx.xScale, xValue),
            y: scaled(ctx.yScale, yValue),
            z: ctx.config.z != null || z != null ? ctx.heightOf(d, z)[1] : 0,
            width: radius,
            depth: radius,
            height: radius,
            color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
          },
        ];
      }),
    opacity: () => opacity,
    emphasize: (_color, size) => size.multiplyScalar(hoverScale),
  });
</script>

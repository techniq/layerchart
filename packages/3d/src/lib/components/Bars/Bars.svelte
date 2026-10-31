<script lang="ts" module>
  import type { Accessor, ColorProp, DataProp } from 'layerchart';

  export type BarsProps = {
    /** Override the chart's `data` */
    data?: any[];
    /** Override the chart's `x` accessor */
    x?: Accessor;
    /** Override the chart's `y` accessor */
    y?: Accessor;
    /**
     * The bar's height: a data key or function (through the chart's `z` scale), or a number of
     * pixels.  Defaults to the chart's `z`, stacked when the chart stacks along `z`.
     */
    z?: DataProp;
    /**
     * A CSS color, or a data key / function run through the chart's color scale.  Defaults to the
     * chart's `c`, else `var(--color-primary, currentColor)`.
     */
    fill?: ColorProp;
    /** @default 1 */
    opacity?: number;
    /**
     * Pixels to leave between a bar and the edges of its band, on every side.
     *
     * @default 0
     */
    insets?: number;
    /**
     * A bar's width and depth in pixels along an axis without bands.
     *
     * @default 10
     */
    size?: number;
  };
</script>

<script lang="ts">
  import { BoxGeometry, Color } from 'three';
  import { getChartContext, isScaleBand } from 'layerchart';

  import { createInstances } from '../../utils/instances.svelte.js';
  import { defined, resolveAccessor, rowColor } from '../../utils/marks.js';

  let {
    data: dataProp,
    x,
    y,
    z,
    fill,
    opacity = 1,
    insets = 0,
    size: sizeProp = 10,
  }: BarsProps = $props();

  const ctx = getChartContext();

  ctx.registerComponent({
    name: 'Bars',
    kind: 'mark',
    markInfo: () => ({
      data: dataProp,
      x,
      y,
      color: typeof fill === 'string' ? fill : undefined,
      stacks: z == null,
    }),
  });

  const rows = $derived((dataProp ?? ctx.data ?? []) as any[]);
  const xAccessor = $derived(resolveAccessor(x, ctx.config.x));
  const yAccessor = $derived(resolveAccessor(y, ctx.config.y));

  /** Where a bar starts along an axis and how far it reaches */
  function extent(scale: any, value: unknown): [number, number] {
    if (isScaleBand(scale)) {
      return [Number(scale(value)) + insets, Math.max(0, scale.bandwidth() - insets * 2)];
    }
    return [Number(scale(value)) - sizeProp / 2, sizeProp];
  }

  const highlight = new Color(0xffffff);

  // A unit cube standing on its corner at the origin, so a bar scales out from `(x, y)` up
  createInstances({
    geometry: new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5),
    instances: () =>
      rows.flatMap((d: any) => {
        const xValue = xAccessor(d);
        const yValue = yAccessor(d);
        if (!defined(xValue) || !defined(yValue)) return [];
        const [x0, width] = extent(ctx.xScale, xValue);
        const [y0, depth] = extent(ctx.yScale, yValue);
        const [z0, z1] = ctx.heightOf(d, z);
        return [
          {
            d,
            x: x0,
            y: y0,
            z: Math.min(z0, z1),
            width,
            depth,
            height: Math.abs(z1 - z0),
            color: rowColor(ctx, fill, d, 'var(--color-primary, currentColor)'),
          },
        ];
      }),
    opacity: () => opacity,
    emphasize: (color) => color.lerp(highlight, 0.25),
  });
</script>

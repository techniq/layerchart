<script lang="ts" module>
  import Text, { type TextProps } from './Text.svelte';
  import { type ComponentProps, type Snippet } from 'svelte';
  import { format as formatValue, type FormatType, type FormatConfig } from '@layerstack/utils';
  import type { Without } from '$lib/utils/types.js';
  import Points, { type Point } from './Points.svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  export type LabelsPropsWithoutHTML<T = any> = {
    /**
     * Override data instead of using context
     */
    data?: T;

    /**
     * Override display value accessor.  By default, uses `y` unless yScale is band scale
     */
    value?: Accessor<T>;

    /**
     * The fill color of the label, which can either be a string or an accessor function
     * that returns a valid `fill` color value.
     *
     * The accessor is useful for dynamic fill colors based on the data the label represents.
     */
    fill?: string | Accessor<T>;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor<T>;

    /**
     * Override `y` accessor from Chart context
     */
    y?: Accessor<T>;

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `x`/`y` are not set.
     */
    seriesKey?: string;

    /**
     * The placement of the label relative to the point.
     * - `outside`: outside the bar/point.
     * - `inside`: inside the bar/point near the value edge.
     * - `middle`: aligned to the value edge with a middle anchor.
     * - `center`: centered within the bar body (between the value edge and baseline).
     * - `smart`: dynamically positions labels based on neighboring point values (peak, trough, rising, falling).
     * @default 'outside'
     */
    placement?: 'inside' | 'outside' | 'middle' | 'center' | 'smart';

    /**
     * The offset of the label from the point
     *
     * @default placement === 'center' || placement === 'middle' ? 0 : 4
     */
    offset?: number;

    /**
     * The format of the label
     */
    format?: FormatType | FormatConfig;

    /**
     * Define unique value for {#each} `(key)` expressions to improve transitions.
     * `index` position used by default
     *
     * @default (d, index) => index
     */
    key?: (d: T, index: number) => any;

    children?: Snippet<[{ data: Point; textProps: ComponentProps<typeof Text> }]>;
  };

  export type LabelsProps<T = any> = LabelsPropsWithoutHTML<T> &
    Without<TextProps, LabelsPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="TData = any">
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import Group from './Group.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createDimensionGetter } from '$lib/utils/rect.svelte.js';

  const ctx = getChartContext();

  // Mark as composite so child Points doesn't register
  ctx.registerComponent({ name: 'Labels', kind: 'composite-mark' });

  let {
    data,
    value,
    x,
    y,
    seriesKey,
    placement = 'outside',
    offset = placement === 'center' || placement === 'middle' ? 0 : 4,
    format,
    key = (_: any, i: number) => i,
    children: childrenProp,
    class: className,
    fill,
    opacity,
    ...restProps
  }: LabelsProps<TData> = $props();

  // Used to compute the bar's bounding rect for `center` placement
  const getDimensions = $derived(createDimensionGetter(ctx, () => ({ x, y })));

  // TODO: Should we let `Points` handle opacity for children snippet as well?
  let series = $derived(ctx.series.series.find((s) => s.key === seriesKey));
  let derivedOpacity = $derived(
    opacity ??
      (series?.key == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
        ? 1
        : 0.1)
  );

  function getTextProps(point: Point, points?: Point[], i?: number): ComponentProps<typeof Text> {
    // Used for positioning direction.
    // For array accessors (edgeIndex defined), use edge position: 0 = start/low, 1 = end/high
    const pointValue = isScaleBand(ctx.yScale) ? point.xValue : point.yValue;
    const isLowEdge = point.edgeIndex != null ? point.edgeIndex === 0 : pointValue < 0;

    // extract the true fill value from `fill` which could be an
    // accessor function or string/undefined
    const fillValue = typeof fill === 'function' ? accessor(fill)(point.data) : fill;

    const displayValue = value
      ? accessor(value)(point.data)
      : isScaleBand(ctx.yScale)
        ? point.xValue
        : point.yValue;

    const formattedValue = formatValue(
      displayValue,
      // @ts-expect-error - improve types
      format ??
        (value
          ? undefined
          : isScaleBand(ctx.yScale)
            ? ctx.xScale.tickFormat?.()
            : ctx.yScale.tickFormat?.())
    );

    let result: ComponentProps<typeof Text>;

    if (isScaleBand(ctx.yScale)) {
      // Position label left/right on horizontal bars
      if (placement === 'center') {
        // Center within the bar body
        const dims = getDimensions(point.data) ?? { x: point.x, y: point.y, width: 0, height: 0 };
        result = {
          value: formattedValue,
          fill: fillValue,
          x: dims.x + dims.width / 2,
          y: dims.y + dims.height / 2,
          textAnchor: 'middle',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      } else if (isLowEdge) {
        // left
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? -offset : offset),
          y: point.y,
          textAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'end' : 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      } else {
        // right
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? offset : -offset),
          y: point.y,
          textAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'start' : 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        };
      }
    } else {
      // Position label top/bottom on vertical bars
      if (placement === 'center') {
        // Center within the bar body
        const dims = getDimensions(point.data) ?? { x: point.x, y: point.y, width: 0, height: 0 };
        result = {
          value: formattedValue,
          fill: fillValue,
          x: dims.x + dims.width / 2,
          y: dims.y + dims.height / 2,
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor: 'middle',
        };
      } else if (isLowEdge) {
        // bottom
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? offset : -offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'start' : 'end',
        };
      } else {
        // top
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? -offset : offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'end' : 'start',
        };
      }
    }

    if (placement === 'smart' && points != null && i != null) {
      const getValue = (p: Point): number => (isScaleBand(ctx.yScale) ? p.xValue : p.yValue);
      const curr = getValue(point);
      const prev = i > 0 ? getValue(points[i - 1]) : curr;
      const next = i < points.length - 1 ? getValue(points[i + 1]) : curr;

      const xPrevTight = Math.abs(prev - curr) < offset;
      const xNextTight = Math.abs(curr - next) < offset;
      const isPeak = (prev <= curr && curr >= next) || (xPrevTight && xNextTight);
      const isTrough = (prev >= curr && curr <= next) || (xPrevTight && xNextTight);
      const isRising = !isPeak && !isTrough && prev < curr;
      const isFalling = !isPeak && !isTrough && prev >= curr;

      return {
        ...result,
        x: point.x,
        y: point.y,
        dx: isRising
          ? xPrevTight
            ? offset
            : -offset
          : isFalling
            ? xNextTight
              ? -offset
              : offset
            : 0,
        dy: isPeak ? -offset : isTrough ? offset : 0,
        textAnchor: isRising
          ? xPrevTight
            ? 'start'
            : 'end'
          : isFalling
            ? xNextTight
              ? 'end'
              : 'start'
            : 'middle',
        verticalAnchor: isPeak ? 'end' : isTrough ? 'start' : 'middle',
      };
    }

    return result;
  }
</script>

<Group class="lc-labels-g" opacity={derivedOpacity as number}>
  <Points {data} {x} {y} {seriesKey}>
    {#snippet children({ points })}
      {#each points as point, i (key(point.data, i))}
        {@const baseProps = getTextProps(point, points, i)}
        {@const textProps = extractLayerProps(baseProps, 'lc-labels-text')}
        {#if childrenProp}
          {@render childrenProp({ data: point, textProps })}
        {:else}
          <Text
            data-placement={placement}
            {...textProps}
            {...restProps}
            {...extractLayerProps(baseProps, 'lc-labels-text', className ?? '')}
          />
        {/if}
      {/each}
    {/snippet}
  </Points>
</Group>

<style>
  @layer components {
    :global(:where(.lc-labels-text)) {
      font-size: 12px;

      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: var(--color-surface-100, light-dark(white, black));

      &[data-placement='inside'],
      &[data-placement='center'] {
        --fill-color: var(--color-surface-100, light-dark(white, black));
        --stroke-color: var(--color-surface-content, currentColor);
      }
    }
  }
</style>

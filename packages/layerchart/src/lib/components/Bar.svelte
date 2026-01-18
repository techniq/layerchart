<script lang="ts" module>
  import { createDimensionGetter, type Insets } from '$lib/utils/rect.svelte.js';

  export type BarPropsWithoutHTML = {
    /**
     * data to render the bar from
     */
    data: Object;

    /**
     * Override `x` from context. Useful for multiple Bar instances
     *
     * @default ctx.x
     */
    x?: Accessor;

    /**
     * Override `y` from context. Useful for multiple Bar instances
     *
     * @default ctx.y
     */
    y?: Accessor;

    /**
     * Override `x1` from context. Useful for multiple Bar instances
     *
     * @default ctx.x1
     */
    x1?: Accessor;

    /**
     * Override `y1` from context. Useful for multiple Bar instances
     *
     * @default ctx.y1
     */
    y1?: Accessor;

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series`.
     */
    seriesKey?: string;

    /**
     * Padding between stacked bars.
     */
    stackPadding?: number;

    radius?: number;

    insets?: Insets;

    initialX?: number;

    initialY?: number;

    initialHeight?: number;

    initialWidth?: number;

    /**
     * Control which corners are rounded with radius. Uses <path> instead of <rect> when not set
     * to `all`
     */
    rounded?:
      | 'all'
      | 'none'
      | 'edge'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';

    motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  } & CommonStyleProps;

  export type BarProps = BarPropsWithoutHTML &
    Without<
      Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'x' | 'y' | 'offset'>,
      BarPropsWithoutHTML
    > &
    CommonEvents;
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { greatestAbs } from '@layerstack/utils';

  import Rect from './Rect.svelte';
  import Path from './Path.svelte';

  import { isScaleBand, isScaleTime } from '../utils/scales.svelte.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import type { CommonEvents, CommonStyleProps, Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';
  import Arc from './Arc.svelte';

  const ctx = getChartContext();

  let {
    data,
    x: xProp,
    y: yProp,
    x1: x1Prop,
    y1: y1Prop,
    seriesKey,
    stackPadding = 0,
    fill,
    fillOpacity,
    stroke: strokeProp = 'black',
    strokeWidth = 0,
    opacity,
    radius = 0,
    rounded: roundedProp = 'all',
    motion,
    insets: insetsProp,
    initialX,
    initialY,
    initialHeight,
    initialWidth,
    ...restProps
  }: BarProps = $props();

  const stroke = $derived(strokeProp === null || strokeProp === undefined ? 'black' : strokeProp);

  // Get series data if seriesKey is provided
  const series = $derived(
    seriesKey ? ctx.series.series.find((s) => s.key === seriesKey) : undefined
  );
  const seriesAccessor = $derived(
    series ? (series.value ?? (series.data ? undefined : series.key)) : undefined
  );

  // Get stack accessors if seriesKey is provided and stacking is enabled
  const stackAccessors = $derived(
    seriesKey && ctx.series.isStacked ? ctx.series.getStackAccessors(seriesKey) : null
  );

  // Resolve accessors: use explicit props first, then stack accessors, then series accessor, then context
  // stackAccessors and seriesAccessor are value accessors and should only be used for the value dimension
  const x = $derived(
    xProp ?? (ctx.valueAxis == 'x' ? (stackAccessors?.value ?? seriesAccessor) : undefined) ?? ctx.x
  );
  const y = $derived(
    yProp ?? (ctx.valueAxis == 'y' ? (stackAccessors?.value ?? seriesAccessor) : undefined) ?? ctx.y
  );
  const x1 = $derived(x1Prop !== undefined ? x1Prop : ctx.x1);
  const y1 = $derived(y1Prop !== undefined ? y1Prop : ctx.y1);

  // Calculate series index and count from context when seriesKey is provided
  const seriesIndex = $derived(
    seriesKey ? ctx.series.visibleSeries.findIndex((s) => s.key === seriesKey) : undefined
  );
  const seriesCount = $derived(ctx.series.visibleSeries.length);

  // Calculate stack insets if stacking is enabled
  const stackInsets = $derived.by(() => {
    if (!ctx.series.isStacked || stackPadding === 0 || seriesIndex === undefined) {
      return undefined;
    }

    const isFirst = seriesIndex === 0;
    const isLast = seriesIndex === seriesCount - 1;
    const stackInset = stackPadding / 2;

    if (ctx.valueAxis === 'y') {
      return {
        bottom: isFirst ? undefined : stackInset,
        top: isLast ? undefined : stackInset,
      };
    } else {
      return {
        left: isFirst ? undefined : stackInset,
        right: isLast ? undefined : stackInset,
      };
    }
  });

  const insets = $derived(insetsProp ?? stackInsets);

  const getDimensions = $derived(
    createDimensionGetter(ctx, () => ({
      x,
      y,
      x1,
      y1,
      insets,
    }))
  );

  const dimensions = $derived(getDimensions(data) ?? { x: 0, y: 0, width: 0, height: 0 });

  const valueAccessor = $derived(accessor(ctx.valueAxis === 'y' ? y : x));
  const value = $derived(valueAccessor(data));
  const resolvedValue = $derived(Array.isArray(value) ? greatestAbs(value) : value);

  // Resolved `rounded="edge"` based on orientation and value
  const rounded = $derived(
    roundedProp === 'edge'
      ? ctx.valueAxis === 'y'
        ? resolvedValue >= 0 && ctx.yRange[0] > ctx.yRange[1] // not inverted (bottom to top)
          ? 'top'
          : 'bottom'
        : resolvedValue >= 0 && ctx.xRange[0] < ctx.xRange[1] // not inverted (left to right)
          ? 'right'
          : 'left'
      : roundedProp
  );

  const topLeft = $derived(['all', 'top', 'left', 'top-left'].includes(rounded));
  const topRight = $derived(['all', 'top', 'right', 'top-right'].includes(rounded));
  const bottomLeft = $derived(['all', 'bottom', 'left', 'bottom-left'].includes(rounded));
  const bottomRight = $derived(['all', 'bottom', 'right', 'bottom-right'].includes(rounded));
  const width = $derived(dimensions.width);
  const height = $derived(dimensions.height);

  // Clamp radius to prevent extending beyond bounding box
  const r = $derived(Math.min(radius, width / 2, height / 2));
  const diameter = $derived(2 * r);

  const pathData = $derived(
    `M${dimensions.x + r},${dimensions.y} h${width - diameter}
      ${topRight ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r}v${r}`}
      v${height - diameter}
      ${bottomRight ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r}h${-r}`}
      h${diameter - width}
      ${bottomLeft ? `a${r},${r} 0 0 1 ${-r},${-r}` : `h${-r}v${-r}`}
      v${diameter - height}
      ${topLeft ? `a${r},${r} 0 0 1 ${r},${-r}` : `v${-r}h${r}`}
      z`
      .split('\n')
      .join('')
  );
</script>

{#if ctx.radial}
  <Arc
    innerRadius={dimensions.y}
    outerRadius={dimensions.y + dimensions.height}
    startAngle={dimensions.x}
    endAngle={dimensions.x + dimensions.width}
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    cornerRadius={radius}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{:else if rounded === 'all' || rounded === 'none' || radius === 0}
  <Rect
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    rx={rounded === 'none' ? 0 : radius}
    {motion}
    {initialX}
    {initialY}
    {initialHeight}
    {initialWidth}
    {...dimensions}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{:else}
  {@const tweenMotion = extractTweenConfig(motion)}
  <Path
    {pathData}
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    motion={tweenMotion}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{/if}

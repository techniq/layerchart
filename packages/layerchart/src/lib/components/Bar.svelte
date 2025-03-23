<script lang="ts" module>
  import { createDimensionGetter, type Insets } from '$lib/utils/rect.svelte.js';

  export type BarPropsWithoutHTML = {
    bar: Object;

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
  } & MotionProps &
    CommonStyleProps;

  export type BarProps = BarPropsWithoutHTML &
    Without<Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'x' | 'y'>, BarPropsWithoutHTML>;
</script>

<script lang="ts">
  import Rect from './Rect.svelte';
  import Spline from './Spline.svelte';

  import { isScaleBand } from '../utils/scales.svelte.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { greatestAbs } from '@layerstack/utils';
  import type { MotionProps } from '$lib/stores/motionState.svelte.js';
  import { getChartContext } from './Chart.svelte';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    bar,
    x,
    y,
    x1,
    y1,
    fill,
    fillOpacity,
    stroke: strokeProp = 'black',
    strokeWidth = 0,
    opacity,
    radius = 0,
    rounded: roundedProp = 'all',
    spring,
    tweened,
    insets,
    initialX,
    initialY,
    initialHeight,
    initialWidth,
    ...restProps
  }: BarProps = $props();

  const stroke = $derived(strokeProp === null || strokeProp === undefined ? 'black' : strokeProp);

  const getDimensions = $derived(
    createDimensionGetter(ctx, () => ({
      x,
      y,
      x1,
      y1,
      insets,
    }))
  );

  const dimensions = $derived(getDimensions(bar) ?? { x: 0, y: 0, width: 0, height: 0 });

  const isVertical = $derived(isScaleBand(ctx.xScale));
  const valueAccessor = $derived(accessor(isVertical ? y : x));
  const value = $derived(valueAccessor(bar));
  const resolvedValue = $derived(Array.isArray(value) ? greatestAbs(value) : value);

  // Resolved `rounded="edge"` based on orientation and value
  const rounded = $derived(
    roundedProp === 'edge'
      ? isVertical
        ? resolvedValue >= 0
          ? 'top'
          : 'bottom'
        : resolvedValue >= 0
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
  const diameter = $derived(2 * radius);
  const pathData = $derived(
    `M${dimensions.x + radius},${dimensions.y} h${width - diameter}
      ${topRight ? `a${radius},${radius} 0 0 1 ${radius},${radius}` : `h${radius}v${radius}`}
      v${height - diameter}
      ${bottomRight ? `a${radius},${radius} 0 0 1 ${-radius},${radius}` : `v${radius}h${-radius}`}
      h${diameter - width}
      ${bottomLeft ? `a${radius},${radius} 0 0 1 ${-radius},${-radius}` : `h${-radius}v${-radius}`}
      v${diameter - height}
      ${topLeft ? `a${radius},${radius} 0 0 1 ${radius},${-radius}` : `v${-radius}h${radius}`}
      z`
      .split('\n')
      .join('')
  );
</script>

{#if rounded === 'all' || rounded === 'none' || radius === 0}
  <Rect
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    rx={rounded === 'none' ? 0 : radius}
    {spring}
    {tweened}
    {initialX}
    {initialY}
    {initialHeight}
    {initialWidth}
    {...dimensions}
    {...extractLayerProps(restProps, 'bar')}
  />
{:else}
  <Spline
    {pathData}
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    {tweened}
    {...extractLayerProps(restProps, 'bar')}
  />
{/if}

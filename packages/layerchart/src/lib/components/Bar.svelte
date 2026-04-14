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
     * Fixed width in pixels. Overrides the scale-derived width and centers the bar within its band.
     */
    width?: number;

    /**
     * Fixed height in pixels. Overrides the scale-derived height and centers the bar within its band.
     */
    height?: number;

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

    /**
     * Setup pointer events to show tooltip for related data.
     */
    tooltip?: boolean;
  } & CommonStyleProps;

  export type BarProps = BarPropsWithoutHTML &
    Without<
      Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'x' | 'y' | 'offset'>,
      BarPropsWithoutHTML
    > &
    CommonEvents;
</script>

<script lang="ts">
  import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';
  import { greatestAbs } from '@layerstack/utils';

  import Rect from './Rect.svelte';

  import { isScaleBand, isScaleTime } from '../utils/scales.svelte.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import type { CommonEvents, CommonStyleProps, Without } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { type MotionProp } from '$lib/utils/motion.svelte.js';
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
    width: widthProp,
    height: heightProp,
    tooltip,
    onpointerenter,
    onpointermove,
    onpointerleave,
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
  const x1 = $derived(x1Prop);
  const y1 = $derived(y1Prop);

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

  const scaleDimensions = $derived(getDimensions(data) ?? { x: 0, y: 0, width: 0, height: 0 });

  // Apply fixed width/height overrides, centering within the scale-derived band
  const dimensions = $derived.by(() => {
    let { x, y, width, height } = scaleDimensions;

    if (widthProp != null) {
      x = x + (width - widthProp) / 2;
      width = widthProp;
    }

    if (heightProp != null) {
      y = y + (height - heightProp) / 2;
      height = heightProp;
    }

    return { x, y, width, height };
  });

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

  // Per-corner radii: [tl, tr, br, bl], matching CSS `border-radius` shorthand.
  const corners = $derived<[number, number, number, number]>([
    topLeft ? radius : 0,
    topRight ? radius : 0,
    bottomRight ? radius : 0,
    bottomLeft ? radius : 0,
  ]);

  // Auto-compute initial values for mount animation when motion is configured
  const resolvedInitialY = $derived(
    initialY ?? (motion && ctx.valueAxis === 'y' ? Math.max(ctx.yRange[0], ctx.yRange[1]) : undefined)
  );
  const resolvedInitialHeight = $derived(
    initialHeight ?? (motion && ctx.valueAxis === 'y' ? 0 : undefined)
  );
  const resolvedInitialX = $derived(
    initialX ?? (motion && ctx.valueAxis === 'x' ? Math.min(ctx.xRange[0], ctx.xRange[1]) : undefined)
  );
  const resolvedInitialWidth = $derived(
    initialWidth ?? (motion && ctx.valueAxis === 'x' ? 0 : undefined)
  );

  const onPointerEnter: PointerEventHandler<Element> = (e) => {
    onpointerenter?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerMove: PointerEventHandler<Element> = (e) => {
    onpointermove?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<Element> = (e) => {
    onpointerleave?.(e);
    if (tooltip) ctx.tooltip.hide();
  };
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
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{:else}
  <Rect
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    {corners}
    {motion}
    initialX={resolvedInitialX}
    initialY={resolvedInitialY}
    initialHeight={resolvedInitialHeight}
    initialWidth={resolvedInitialWidth}
    {...dimensions}
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{/if}

<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';

  import Spline, { type SplinePropsWithoutHTML } from './Spline.svelte';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type ArcPropsWithoutHTML = {
    value?: number;
    initialValue?: number;

    /**
     * Domain [min,max] in degrees
     *
     * @default [0, 100];
     */
    domain?: [number, number];

    /**
     * Range [min,max] in degrees. See also startAngle/endAngle
     *
     * @default [0, 360]
     */
    range?: [number, number];

    /**
     * Start angle in radians
     */
    startAngle?: number;

    /**
     * End angle in radians
     */
    endAngle?: number;

    /**
     * Define innerRadius. Defaults to yRange min
     *   • value >= 1: discrete value
     *   • value < 1: percent of `outerRadius`
     *   • value < 0: offset of `outerRadius`
     */
    innerRadius?: number;

    /**
     * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
     *   • value >= 1: discrete value
     *   • value < 1: percent of chart width or height (smallest) / 2
     *   • value < 0: offset of chart width or height (smallest) / 2
     */
    outerRadius?: number;

    /**
     * Corner radius of the arc
     *
     * @default 0
     */
    cornerRadius?: number;

    /**
     * Angle between the arcs
     *
     * @default 0
     */
    padAngle?: number;

    /**
     * Start angle in radians
     */
    trackStartAngle?: number;

    /**
     * End angle in radians
     */
    trackEndAngle?: number;

    /**
     * Define innerRadius. Defaults to yRange min
     *   • value >= 1: discrete value
     *   • value < 1: percent of `outerRadius`
     *   • value < 0: offset of `outerRadius`
     */
    trackInnerRadius?: number;

    /**
     * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
     *   • value >= 1: discrete value
     *   • value < 1: percent of chart width or height (smallest) / 2
     *   • value < 0: offset of chart width or height (smallest) / 2
     */
    trackOuterRadius?: number;

    /**
     * Corner radius of the arc
     *
     * @default 0
     */
    trackCornerRadius?: number;

    /**
     * Angle between the arcs
     *
     * @default 0
     */
    trackPadAngle?: number;

    /**
     * Offset arc from center
     *
     * @default 0
     */
    offset?: number;

    /**
     * Tooltip context to setup pointer events to show tooltip for related data.
     *
     * **Must set `data` prop as well**
     */
    tooltipContext?: TooltipContextValue;

    /**
     * Data to set when showing tooltip
     */
    data?: any;

    /**
     * Pass true to enable the track with default props, or pass an object
     * of props to enable the track.
     */
    track?: boolean | Partial<ComponentProps<typeof Spline>>;

    /**
     * A reference to the track element
     *
     * @bindable
     */
    trackRef?: SVGPathElement;

    /**
     * A reference to the arc element
     *
     * @bindable
     */
    ref?: SVGPathElement;

    children?: Snippet<
      [
        {
          centroid: [number, number];
          boundingBox: DOMRect;
          value: number;
          getTrackTextProps: GetArcTextProps;
          getArcTextProps: GetArcTextProps;
        },
      ]
    >;

    motion?: MotionProp;
  } & CommonStyleProps;

  export type ArcProps = ArcPropsWithoutHTML &
    // we omit the spline props to avoid conflicts with attribute names since we are
    // passing them through to `<Spline />`
    Without<SVGAttributes<SVGPathElement>, ArcPropsWithoutHTML & SplinePropsWithoutHTML>;
</script>

<script lang="ts">
  /*
		TODO:
		- [ ] Allow spring/tweened to be reactive (but ignore value)
	*/
  // https://caniuse.com/#feat=css-conic-gradients
  // https://css-tricks.com/snippets/css/css-conic-gradient/
  // https://developer.mozilla.org/en-US/docs/Web/CSS/conic-gradient

  // https://stackoverflow.com/questions/2465405/svg-angular-gradient
  // https://stackoverflow.com/questions/18206361/svg-multiple-color-on-circle-stroke

  // https://bl.ocks.org/mbostock/4163057
  // https://github.com/d3/d3/issues/2427#issuecomment-100759055
  // https://github.com/mnsht/gradient-path

  // https://svelte.dev/repl/09711e43a1264ba18945d7db7cab9335?version=3.38.2
  // https://codepen.io/simeydotme/pen/rrOEmO/

  import { arc as d3arc } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';

  import { degreesToRadians } from '$lib/utils/math.js';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';
  import { cls } from '@layerstack/tailwind';
  import { max } from 'd3-array';
  import {
    createArcTextProps,
    type ArcTextOptions,
    type ArcTextPosition,
    type GetArcTextProps,
  } from '$lib/utils/arcText.svelte.js';

  let {
    ref: refProp = $bindable(),
    trackRef: trackRefProp = $bindable(),
    motion,
    value = 0,
    initialValue = 0,
    domain = [0, 100],
    range = [0, 360], // degrees
    startAngle: startAngleProp,
    endAngle: endAngleProp,
    innerRadius: innerRadiusProp,
    outerRadius: outerRadiusProp,
    cornerRadius = 0,
    padAngle = 0,
    trackStartAngle: trackStartAngleProp,
    trackEndAngle: trackEndAngleProp,
    trackInnerRadius: trackInnerRadiusProp,
    trackOuterRadius: trackOuterRadiusProp,
    trackCornerRadius: trackCornerRadiusProp,
    trackPadAngle: trackPadAngleProp,
    fill,
    fillOpacity,
    stroke = 'none',
    strokeWidth,
    opacity,
    data,
    offset = 0,
    onpointerenter = () => {},
    onpointermove = () => {},
    onpointerleave = () => {},
    ontouchmove = () => {},
    tooltipContext,
    track = false,
    children,
    class: className,
    ...restProps
  }: ArcProps = $props();

  let ref = $state<SVGPathElement>();
  let trackRef = $state<SVGPathElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  $effect.pre(() => {
    trackRefProp = trackRef;
  });

  const ctx = getChartContext();

  const endAngle = $derived(
    endAngleProp ?? degreesToRadians(ctx.config.xRange ? max(ctx.xRange) : max(range))
  );

  const motionEndAngle = createMotion(initialValue, () => value, motion);

  const scale = $derived(scaleLinear().domain(domain).range(range));

  function getOuterRadius(outerRadius: number | undefined, chartRadius: number) {
    if (!outerRadius) {
      return chartRadius;
    } else if (outerRadius > 1) {
      // discrete value
      return outerRadius;
    } else if (outerRadius > 0) {
      // percent of `chartRadius`
      return chartRadius * outerRadius;
    } else if (outerRadius < 0) {
      // offset of `chartRadius`
      return chartRadius + outerRadius;
    } else {
      // 0
      return outerRadius;
    }
  }

  const outerRadius = $derived(
    getOuterRadius(outerRadiusProp, (Math.min(ctx.xRange[1], ctx.yRange[0]) ?? 0) / 2)
  );
  const trackOuterRadius = $derived(
    trackOuterRadiusProp
      ? getOuterRadius(trackOuterRadiusProp, (Math.min(ctx.xRange[1], ctx.yRange[0]) ?? 0) / 2)
      : outerRadius
  );

  function getInnerRadius(innerRadius: number | undefined, outerRadius: number) {
    if (innerRadius == null) {
      return Math.min(...ctx.yRange);
    } else if (innerRadius > 1) {
      // discrete value
      return innerRadius;
    } else if (innerRadius > 0) {
      // percent of `outerRadius`
      return outerRadius * innerRadius;
    } else if (innerRadius < 0) {
      // offset of `outerRadius`
      return outerRadius + innerRadius;
    } else {
      // 0
      return innerRadius;
    }
  }

  const innerRadius = $derived(getInnerRadius(innerRadiusProp, outerRadius));
  const trackInnerRadius = $derived(
    trackInnerRadiusProp ? getInnerRadius(trackInnerRadiusProp, trackOuterRadius) : innerRadius
  );

  const startAngle = $derived(startAngleProp ?? degreesToRadians(range[0]));
  const trackStartAngle = $derived(
    trackStartAngleProp ?? startAngleProp ?? degreesToRadians(range[0])
  );
  const trackEndAngle = $derived(trackEndAngleProp ?? endAngleProp ?? degreesToRadians(range[1]));
  const trackCornerRadius = $derived(trackCornerRadiusProp ?? cornerRadius);
  const trackPadAngle = $derived(trackPadAngleProp ?? padAngle);

  const arcEndAngle = $derived(endAngleProp ?? degreesToRadians(scale(motionEndAngle.current)));

  const arc = $derived(
    d3arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(arcEndAngle)
      .cornerRadius(cornerRadius)
      .padAngle(padAngle)
  );

  const trackArc = $derived(
    d3arc()
      .innerRadius(trackInnerRadius)
      .outerRadius(trackOuterRadius)
      .startAngle(trackStartAngle)
      .endAngle(trackEndAngle)
      .cornerRadius(trackCornerRadius)
      .padAngle(trackPadAngle)
  );

  const angle = $derived(((startAngle ?? 0) + (endAngle ?? 0)) / 2);
  const xOffset = $derived(Math.sin(angle) * offset);
  const yOffset = $derived(-Math.cos(angle) * offset);

  const trackArcCentroid = $derived.by(() => {
    // @ts-expect-error - this is fine.
    const centroid = trackArc.centroid() as [number, number];

    return [centroid[0] + xOffset, centroid[1] + yOffset];
  }) as [number, number];

  const boundingBox = $derived(trackRef ? trackRef.getBBox() : ({} as DOMRect));

  const onPointerEnter: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerenter?.(e);
    tooltipContext?.show(e, data);
  };

  const onPointerMove: PointerEventHandler<SVGPathElement> = (e) => {
    onpointermove?.(e);
    tooltipContext?.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerleave?.(e);
    tooltipContext?.hide();
  };

  function getTrackTextProps(position: ArcTextPosition, opts: ArcTextOptions = {}) {
    return createArcTextProps(
      {
        startAngle: () => trackStartAngle,
        endAngle: () => trackEndAngle,
        outerRadius: () => trackOuterRadius + (opts.outerPadding ? opts.outerPadding : 0),
        innerRadius: () => trackInnerRadius,
        cornerRadius: () => trackCornerRadius,
        centroid: () => trackArcCentroid,
      },
      opts,
      position
    ).current;
  }

  function getArcTextProps(position: ArcTextPosition, opts: ArcTextOptions = {}) {
    return createArcTextProps(
      {
        startAngle: () => startAngle,
        endAngle: () => arcEndAngle,
        outerRadius: () => outerRadius + (opts.outerPadding ? opts.outerPadding : 0),
        innerRadius: () => innerRadius,
        cornerRadius: () => cornerRadius,
        centroid: () => trackArcCentroid,
      },
      opts,
      position
    ).current;
  }
</script>

{#if track}
  <Spline
    pathData={trackArc()}
    stroke="none"
    bind:splineRef={trackRef}
    {...extractLayerProps(track, 'arc-track')}
  />
{/if}

<Spline
  bind:splineRef={ref}
  pathData={arc()}
  transform="translate({xOffset}, {yOffset})"
  {fill}
  {fillOpacity}
  {stroke}
  stroke-width={strokeWidth}
  {opacity}
  {...restProps}
  class={cls(layerClass('arc-line'), className)}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  ontouchmove={(e) => {
    ontouchmove?.(e);
    if (!tooltipContext) return;
    // Prevent touch to not interfere with pointer when using tooltip
    e.preventDefault();
  }}
/>

{@render children?.({
  centroid: trackArcCentroid,
  boundingBox,
  value: motionEndAngle.current,
  getTrackTextProps: getTrackTextProps,
  getArcTextProps: getArcTextProps,
})}

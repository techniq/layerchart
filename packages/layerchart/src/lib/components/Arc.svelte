<script lang="ts" module>
  type ArcPropsWithoutHTML = {
    spring?: boolean | SpringOptions;
    tweened?: boolean | TweenedOptions;

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

    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;

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
     * Track
     */
    track?: boolean | Partial<ComponentProps<Spline>>;

    /**
     * Event handlers
     */
    onclick?: (e: MouseEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointermove?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
  };
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

  import { tick, type ComponentProps } from 'svelte';
  import { arc as d3arc } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';

  import { motionState, type SpringOptions, type TweenedOptions } from '$lib/stores/motionStore.js';
  import { degreesToRadians } from '$lib/utils/math.js';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import Spline from './Spline.svelte';
  import { watch } from 'runed';
  import { getChartContext } from './Chart-Next.svelte';

  let {
    spring,
    tweened,
    value = 0,
    initialValue = value,
    domain = [0, 100],
    range = [0, 360], // degrees
    startAngle: startAngleProp,
    endAngle: endAngleProp,
    innerRadius: innerRadiusProp,
    outerRadius: outerRadiusProp,
    cornerRadius = 0,
    padAngle = 0,
    fill,
    fillOpacity,
    stroke = 'none',
    strokeWidth,
    opacity,
    data,
    offset = 0,
    onclick = () => {},
    onpointerenter = () => {},
    onpointermove = () => {},
    onpointerleave = () => {},
    tooltipContext,
    track = false,
  }: ArcPropsWithoutHTML = $props();

  const tweenedState = $derived(motionState(initialValue, { spring, tweened }));

  watch(
    () => value,
    () => {
      tick().then(() => {
        tweenedState.set(value);
      });
    }
  );

  const ctx = getChartContext();

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

  const startAngle = $derived(startAngleProp ?? degreesToRadians(range[0]));
  const endAngle = $derived(endAngleProp ?? degreesToRadians(range[1]));

  const arc = $derived(
    d3arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(cornerRadius)
      .padAngle(padAngle)
  ) as Function;

  const trackArc = $derived(
    d3arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(cornerRadius)
      .padAngle(padAngle)
  ) as Function;

  // @ts-expect-error - idk
  const trackArcCentroid = trackArc.centroid();

  let trackArcEl: SVGPathElement = $state(null!);

  const boundingBox = $derived(trackArcEl ? trackArcEl.getBBox() : ({} as DOMRect));

  // $: labelArcCenterOffset = {
  //   x: outerRadius - boundingBox.width / 2,
  //   // x: 0,
  //   y: (outerRadius - boundingBox.height / 2) * -1,
  // };
  // $: console.log(labelArcCenterOffset)

  // $: labelArcBottomOffset = {
  //   // x: outerRadius - boundingBox.width / 2,
  //   x: outerRadius - boundingBox.width / 2,
  //   // x: 0,
  //   // y: (outerRadius - boundingBox.height) * -1
  //   y: (outerRadius - boundingBox.height) * -1,
  // };
  // $: console.log(labelArcBottomOffset)

  const angle = $derived(((startAngle ?? 0) + (endAngle ?? 0)) / 2);
  const xOffset = $derived(Math.sin(angle) * offset);
  const yOffset = $derived(-Math.cos(angle) * offset);

  function onPointerEnter(e: PointerEvent) {
    onpointerenter?.(e);
    tooltipContext?.show(e, data);
  }
  function onPointerMove(e: PointerEvent) {
    onpointermove?.(e);
    tooltipContext?.show(e, data);
  }
  function onPointerLeave(e: PointerEvent) {
    onpointerleave?.(e);
    tooltipContext?.hide();
  }
</script>

{#if track}
  <Spline
    pathData={trackArc()}
    class="track"
    stroke="none"
    bind:pathRef={trackArcEl}
    {...typeof track === 'object' ? track : null}
  />
{/if}

<Spline
  pathData={arc()}
  transform="translate({xOffset}, {yOffset})"
  {fill}
  {fillOpacity}
  {stroke}
  stroke-width={strokeWidth}
  {opacity}
  class={className}
  {...$$restProps}
  {onclick}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  ontouchmove={(e) => {
    if (tooltipContext) {
      // Prevent touch to not interfer with pointer when using tooltip
      e.preventDefault();
    }
  }}
  on:touchmove
/>

<slot value={tweenedState.current} centroid={trackArcCentroid} {boundingBox} />

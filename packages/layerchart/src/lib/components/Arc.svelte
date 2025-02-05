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

  import { onDestroy, tick } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { arc as d3arc } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { min, max } from 'd3-array';
  import { merge } from 'lodash-es';

  import { objectId } from '@layerstack/utils/object';

  import { chartContext } from './ChartContext.svelte';
  import { motionStore } from '$lib/stores/motionStore.js';
  import { degreesToRadians } from '$lib/utils/math.js';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let value = 0;
  export let initialValue = value;
  let tweened_value = motionStore(initialValue, { spring, tweened });

  $: tick().then(() => {
    tweened_value.set(value);
  });

  export let domain = [0, 100];

  /**
   * Range [min,max] in degrees.  See also startAngle/endAngle
   */
  export let range = [0, 360]; // degrees

  /**
   * Start angle in radians
   */
  export let startAngle: number | undefined = undefined;

  /**
   * End angle in radians
   */
  export let endAngle: number | undefined = undefined;

  /**
   * Define innerRadius. Defaults to yRange min
   *   • value >= 1: discrete value
   *   • value < 1: percent of `outerRadius`
   *   • value < 0: offset of `outerRadius`
   */
  export let innerRadius: number | undefined = undefined;

  /**
   * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/ 2)
   *   • value >= 1: discrete value
   *   • value < 1: percent of chart height / 2
   *   • value < 0: offset of chart height / 2
   */
  export let outerRadius: number | undefined = undefined;

  export let cornerRadius = 0;
  export let padAngle = 0;
  // export let padRadius = 0;

  export let fill: string | undefined = undefined;
  export let fillOpacity: number | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };

  export let track: boolean | SVGAttributes<SVGPathElement> = false;

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

  const { xRange, yRange } = chartContext();

  $: scale = scaleLinear().domain(domain).range(range);

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

  $: _outerRadius = getOuterRadius(outerRadius, (Math.min($xRange[1], $yRange[0]) ?? 0) / 2);

  function getInnerRadius(innerRadius: number | undefined, outerRadius: number) {
    if (innerRadius == null) {
      return Math.min(...$yRange);
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
  $: _innerRadius = getInnerRadius(innerRadius, _outerRadius);

  $: arc = d3arc()
    .innerRadius(_innerRadius)
    .outerRadius(_outerRadius)
    .startAngle(startAngle ?? degreesToRadians(range[0]))
    .endAngle(endAngle ?? degreesToRadians(scale($tweened_value)))
    .cornerRadius(cornerRadius)
    .padAngle(padAngle) as Function;
  // .padRadius(padRadius);

  $: trackArc = d3arc()
    .innerRadius(_innerRadius)
    .outerRadius(_outerRadius)
    .startAngle(startAngle ?? degreesToRadians(range[0]))
    .endAngle(endAngle ?? degreesToRadians(range[1]))
    .cornerRadius(cornerRadius)
    .padAngle(padAngle) as Function;
  // .padRadius(padRadius);

  // @ts-expect-error
  $: trackArcCentroid = trackArc.centroid();
  // $: console.log(trackArcCentroid)

  let trackArcEl: SVGPathElement | undefined = undefined;
  $: boundingBox = trackArcEl ? trackArcEl.getBBox() : ({} as DOMRect);

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

  /**
   * Offset arc from center
   */
  export let offset = 0;
  $: angle = ((startAngle ?? 0) + (endAngle ?? 0)) / 2;
  $: xOffset = Math.sin(angle) * offset;
  $: yOffset = -Math.cos(angle) * offset;

  /**
   * Tooltip context to setup pointer events to show tooltip for related data.  Must set `data` prop as well
   */
  export let tooltip: TooltipContextValue | undefined = undefined;

  /**
   * Data to set when showing tooltip
   */
  export let data: any = undefined;

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    ctx.translate(xOffset, yOffset);

    // Track
    const trackProps = { ...(typeof track === 'object' ? track : null) };
    renderPathData(ctx, trackArc(), {
      styles: {
        fill: trackProps['fill'] ?? undefined,
        fillOpacity: trackProps['fill-opacity'] ?? undefined,
        stroke: trackProps['stroke'] ?? undefined,
        strokeWidth: trackProps['stroke-width'] ?? undefined,
        opacity: trackProps['opacity'] ?? undefined,
      },
      classes: trackProps.class ?? undefined,
    });

    // Arc
    renderPathData(
      ctx,
      arc(),
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props change
    arc && trackArc && fillKey && fillOpacity && strokeKey && strokeWidth && className;
    canvasContext.invalidate();
  }

  // Hide `tooltip` reactivity
  function _onPointerEnter(e: PointerEvent) {
    onpointerenter?.(e);
    tooltip?.show(e, data);
  }
  function _onPointerMove(e: PointerEvent) {
    onpointermove?.(e);
    tooltip?.show(e, data);
  }
  function _onPointerLeave(e: PointerEvent) {
    onpointerleave?.(e);
    tooltip?.hide();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Arc',
      render,
      events: {
        click: onclick,
        pointerenter: _onPointerEnter,
        pointermove: _onPointerMove,
        pointerleave: _onPointerLeave,
      },
    });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'svg'}
  {#if track}
    <path
      d={trackArc()}
      class="track"
      bind:this={trackArcEl}
      {...typeof track === 'object' ? track : null}
    />
  {/if}

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <path
    d={arc()}
    transform="translate({xOffset}, {yOffset})"
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    class={className}
    {...$$restProps}
    on:click={onclick}
    on:pointerenter={onpointerenter}
    on:pointermove={_onPointerMove}
    on:pointerleave={_onPointerLeave}
    on:touchmove={(e) => {
      if (tooltip) {
        // Prevent touch to not interfer with pointer when using tooltip
        e.preventDefault();
      }
    }}
    on:touchmove
  />
{/if}

<slot value={$tweened_value} centroid={trackArcCentroid} {boundingBox} />

<script lang="ts">
  /*
    See also:
      - https://observablehq.com/@d3/difference-chart
      - https://github.com/airbnb/visx/issues/245
  */
  import { area as d3Area, line as d3Line } from 'd3-shape';
  import type { CurveFactory } from 'd3-shape';
  import { min, max } from 'd3-array';
  import { chartContext } from './ChartContext.svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  const { data: contextData, xGet, yGet, yRange } = chartContext();

  // Properties to override what is used from context
  export let data: any = undefined; // TODO: Update Type
  export let x: Accessor = undefined;
  export let y0: Accessor = undefined;
  export let y1: Accessor = undefined;

  export let curve: CurveFactory | undefined = undefined;
  export let defined: Parameters<typeof areaPath.defined>[0] | undefined = undefined;
  export let id = Math.random().toString(16).slice(-4);

  const _x = accessor(x);
  const _y0 = accessor(y0);
  const _y1 = accessor(y1);

  $: areaPath = d3Area()
    .x(x ? _x : $xGet)
    .y0(y0 ? _y0 : (d: any) => $yGet(d)[0])
    .y1(y1 ? _y1 : (d: any) => $yGet(d)[1]);
  $: if (curve) areaPath.curve(curve);
  $: if (defined) areaPath.defined(defined);

  $: clipPathBelow = d3Area()
    .x(x ? _x : $xGet)
    .y0(y0 ? _y0 : (d: any) => $yGet(d)[0])
    .y1(y1 ? _y1 : (d: any) => max($yRange));
  $: if (curve) clipPathBelow.curve(curve);
  $: if (defined) clipPathBelow.defined(defined);

  $: clipPathAbove = d3Area()
    .x(x ? _x : $xGet)
    .y0(y0 ? _y0 : (d: any) => max($yRange))
    .y1(y1 ? _y1 : (d: any) => $yGet(d)[1]);
  $: if (curve) clipPathAbove.curve(curve);
  $: if (defined) clipPathAbove.defined(defined);

  $: linePathAbove = d3Line()
    .x(x ? _x : $xGet)
    .y(y0 ? _y0 : (d: any) => $yGet(d)[0]);
  $: if (curve) linePathAbove.curve(curve);
  $: if (defined) linePathAbove.defined(defined);

  $: linePathBelow = d3Line()
    .x(x ? _x : $xGet)
    .y(y1 ? _y1 : (d: any) => $yGet(d)[1]);
  $: if (curve) linePathBelow.curve(curve);
  $: if (defined) linePathBelow.defined(defined);
</script>

<!-- Recreate on curve change as otherwise is 1 state change behind for some reason -->
{#key curve}
  <g class="clip-paths">
    <defs>
      <clipPath id="threshold-clip-below-{id}">
        <path d={clipPathBelow(data ?? $contextData)} />
      </clipPath>
      <clipPath id="threshold-clip-above-{id}">
        <path d={clipPathAbove(data ?? $contextData)} />
      </clipPath>
    </defs>
  </g>

  <slot
    name="pathAbove"
    areaPathData={areaPath(data ?? $contextData)}
    clipPath="url(#threshold-clip-below-{id})"
    linePathData={linePathAbove(data ?? $contextData)}
  />

  <slot
    name="pathBelow"
    areaPathData={areaPath(data ?? $contextData)}
    clipPath="url(#threshold-clip-above-{id})"
    linePathData={linePathBelow(data ?? $contextData)}
  />
{/key}

<!-- Fix `<Threshold> received an unexpected slot "default".` warning -->
<slot />

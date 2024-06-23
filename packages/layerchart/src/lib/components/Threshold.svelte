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

  const { data: contextData, xGet, yGet, yRange } = chartContext();

  // Properties to override what is used from context
  export let data: any = undefined; // TODO: Update Type
  export let x: any = undefined; // TODO: Update Type
  export let y0: any = undefined; // TODO: Update Type
  export let y1: any = undefined; // TODO: Update Type

  export let curve: CurveFactory = undefined;
  export let defined: Parameters<typeof areaPath.defined>[0] = undefined;
  export let id = Math.random().toString(16).slice(-4);

  $: areaPath = d3Area()
    .x(x ?? $xGet)
    .y0(y0 ?? ((d) => $yGet(d)[0]))
    .y1(y1 ?? ((d) => $yGet(d)[1]));
  $: if (curve) areaPath.curve(curve);
  $: if (defined) areaPath.defined(defined);

  $: clipPathBelow = d3Area()
    .x(x ?? $xGet)
    .y0(y0 ?? ((d) => $yGet(d)[0]))
    .y1(y1 ?? ((d) => max($yRange)));
  $: if (curve) clipPathBelow.curve(curve);
  $: if (defined) clipPathBelow.defined(defined);

  $: clipPathAbove = d3Area()
    .x(x ?? $xGet)
    .y0(y0 ?? ((d) => max($yRange)))
    .y1(y1 ?? ((d) => $yGet(d)[1]));
  $: if (curve) clipPathAbove.curve(curve);
  $: if (defined) clipPathAbove.defined(defined);

  $: linePathAbove = d3Line()
    .x(x ?? $xGet)
    .y(y0 ?? ((d) => $yGet(d)[0]));
  $: if (curve) linePathAbove.curve(curve);
  $: if (defined) linePathAbove.defined(defined);

  $: linePathBelow = d3Line()
    .x(x ?? $xGet)
    .y(y1 ?? ((d) => $yGet(d)[1]));
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

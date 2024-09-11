<script lang="ts">
  /*
    See also:
      - https://observablehq.com/@d3/difference-chart
      - https://github.com/airbnb/visx/issues/245
  */
  import type { ComponentProps } from 'svelte';
  import type { CurveFactory } from 'd3-shape';
  import { min } from 'd3-array';

  import { chartContext } from './ChartContext.svelte';
  import Area from './Area.svelte';
  import ClipPath from './ClipPath.svelte';

  const { y, yDomain } = chartContext();

  export let curve: CurveFactory | undefined = undefined;
  export let defined: ComponentProps<Area>['defined'] | undefined = undefined;
</script>

<!-- Recreate on curve change as otherwise is 1 state change behind for some reason -->
{#key curve}
  <ClipPath>
    <svelte:fragment slot="clip">
      <Area y0={(d) => $y(d)[0]} y1={(d) => min($yDomain)} {curve} {defined} />
    </svelte:fragment>

    <slot name="above" {curve} {defined} />
  </ClipPath>

  <ClipPath>
    <svelte:fragment slot="clip">
      <Area y0={(d) => min($yDomain)} y1={(d) => $y(d)[1]} {curve} {defined} />
    </svelte:fragment>

    <slot name="below" {curve} {defined} />
  </ClipPath>

  <slot {curve} {defined} />
{/key}

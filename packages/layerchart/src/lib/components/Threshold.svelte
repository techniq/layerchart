<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import type { CurveFactory } from 'd3-shape';
  export type ThresholdSnippetProps = {
    curve?: CurveFactory;
    defined?: ComponentProps<typeof Area>['defined'];
  };

  export type ThresholdProps = {
    /**
     * The curve factory to use for the area.
     *
     */
    curve?: CurveFactory;

    /**
     * Function to determine if a point is defined.
     *
     */
    defined?: ComponentProps<typeof Area>['defined'];

    /**
     * Content to render above the threshold area.
     */
    above?: Snippet<[ThresholdSnippetProps]>;

    /**
     * Content to render below the threshold area.
     */
    below?: Snippet<[ThresholdSnippetProps]>;

    children?: Snippet<[ThresholdSnippetProps]>;
  };
</script>

<script lang="ts">
  /*
    See also:
      - https://observablehq.com/@d3/difference-chart
      - https://github.com/airbnb/visx/issues/245
  */

  import { min } from 'd3-array';

  import Area from './Area.svelte';
  import ClipPath from './ClipPath.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  let { curve, defined, below, above, children }: ThresholdProps = $props();
</script>

<!-- Recreate on curve change as otherwise is 1 state change behind for some reason -->
{#key curve}
  <ClipPath>
    {#snippet clip()}
      <Area y0={(d) => ctx.y(d)[0]} y1={(d) => min(ctx.yDomain)} {curve} {defined} />
    {/snippet}
    {@render above?.({ curve, defined })}
  </ClipPath>

  <ClipPath>
    {#snippet clip()}
      <Area y0={(d) => min(ctx.yDomain)} y1={(d) => ctx.y(d)[1]} {curve} {defined} />
    {/snippet}

    {@render below?.({ curve, defined })}
  </ClipPath>

  {@render children?.({ curve, defined })}
{/key}

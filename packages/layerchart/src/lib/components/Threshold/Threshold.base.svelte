<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ThresholdProps } from './Threshold.shared.svelte.js';

  export type ThresholdBaseLayerComponents = {
    Area: Component<any>;
    ClipPath: Component<any>;
  };

  export type ThresholdBaseProps = ThresholdProps & ThresholdBaseLayerComponents;
</script>

<script lang="ts">
  import { min, max } from 'd3-array';
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  // Mark as composite so child Areas don't register
  ctx.registerComponent({ name: 'Threshold', kind: 'composite-mark' });

  let { Area, ClipPath, curve, defined, below, above, children }: ThresholdBaseProps = $props();
</script>

{#key curve}
  <ClipPath>
    {#snippet clip()}
      <Area y0={(d: any) => ctx.y(d)[1]} y1={(d: any) => max(ctx.yDomain)} {curve} {defined} />
    {/snippet}
    {@render above?.({ curve, defined })}
  </ClipPath>

  <ClipPath>
    {#snippet clip()}
      <Area y0={(d: any) => min(ctx.yDomain)} y1={(d: any) => ctx.y(d)[1]} {curve} {defined} />
    {/snippet}

    {@render below?.({ curve, defined })}
  </ClipPath>

  {@render children?.({ curve, defined })}
{/key}

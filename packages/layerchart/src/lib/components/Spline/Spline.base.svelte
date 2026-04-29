<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { SplineProps } from './Spline.shared.svelte.js';

  export type SplineBaseLayerComponents = {
    Path: Component<any>;
  };

  export type SplineBaseProps = SplineProps & SplineBaseLayerComponents;
</script>

<script lang="ts">
  import { SplineState } from './Spline.shared.svelte.js';

  let {
    Path,
    data,
    x,
    y,
    seriesKey,
    defined,
    curve,
    stroke,
    fill,
    opacity,
    motion,
    ...restProps
  }: SplineBaseProps = $props();

  const c = new SplineState(
    () =>
      ({ data, x, y, seriesKey, defined, curve, stroke, fill, opacity, motion }) as SplineProps
  );
</script>

{#if c.segments}
  {#each c.segments as seg, i (i)}
    <Path
      pathData={seg.d}
      stroke={seg.stroke}
      fill={seg.fill}
      opacity={seg.opacity ?? c.seriesOpacity}
      {...c.series?.props}
      {...restProps}
    />
  {/each}
{:else}
  <Path
    pathData={c.isTweened ? c.tweenedPath : c.d}
    stroke={(typeof stroke === 'string' ? stroke : undefined) ?? c.series?.color}
    fill={typeof fill === 'string' ? fill : undefined}
    opacity={(typeof opacity === 'number' ? opacity : undefined) ?? c.seriesOpacity}
    {...c.series?.props}
    {...restProps}
  />
{/if}

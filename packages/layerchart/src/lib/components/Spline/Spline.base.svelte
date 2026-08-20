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
    z,
    seriesKey,
    defined,
    curve,
    stroke,
    fill,
    opacity,
    // Pulled out of `restProps` so a function-valued `class` isn't spread onto the element
    class: className,
    motion,
    ...restProps
  }: SplineBaseProps = $props();

  const c = new SplineState(
    () =>
      ({
        data,
        x,
        y,
        z,
        seriesKey,
        defined,
        curve,
        stroke,
        fill,
        opacity,
        class: className,
        motion,
      }) as SplineProps
  );
</script>

{#if c.segments}
  {#each c.segments as seg, i (i)}
    <Path
      pathData={seg.d}
      stroke={seg.stroke}
      fill={seg.fill}
      opacity={seg.opacity ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity)}
      class={seg.class}
      {...c.series?.props}
      {...restProps}
    />
  {/each}
{:else}
  <Path
    pathData={c.isTweened ? c.tweenedPath : c.d}
    stroke={c.resolvedStroke}
    fill={c.resolvedFill}
    opacity={(typeof opacity === 'number' ? opacity : undefined) ??
      (c.seriesOpacity === 1 ? undefined : c.seriesOpacity)}
    class={c.resolvedClass}
    {...c.series?.props}
    {...restProps}
  />
{/if}

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
    // Ends of the *line*, not of each path. A style function splits one line into a path per run
    // of matching style, and spreading these would give every run its own arrow head / end label.
    marker,
    markerStart,
    markerMid,
    markerEnd,
    startContent,
    endContent,
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
  <!--
    Consecutive style runs share their boundary point — it is the last vertex of one path and the
    first of the next. That point is interior to the line, so it takes the *mid* marker, once:
    from the following run's start, with the preceding run's end left bare.
  -->
  {#each c.segments as seg, i (i)}
    <Path
      pathData={seg.d}
      stroke={seg.stroke}
      fill={seg.fill}
      opacity={seg.opacity ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity)}
      class={seg.class}
      markerMid={markerMid ?? marker}
      markerStart={seg.lineStart ? (markerStart ?? marker) : (markerMid ?? marker)}
      markerEnd={seg.lineEnd ? (markerEnd ?? marker) : undefined}
      startContent={seg.lineStart ? startContent : undefined}
      endContent={seg.lineEnd ? endContent : undefined}
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
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    {startContent}
    {endContent}
    {...c.series?.props}
    {...restProps}
  />
{/if}

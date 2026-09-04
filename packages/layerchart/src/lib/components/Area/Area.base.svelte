<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AreaProps } from './Area.shared.svelte.js';

  export type AreaBaseLayerComponents = {
    Path: Component<any>;
    Spline: Component<any>;
  };

  export type AreaBaseProps = AreaProps & AreaBaseLayerComponents;
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { AreaState } from './Area.shared.svelte.js';

  let {
    Path,
    Spline,
    curve,
    data,
    defined,
    fill,
    stroke = 'none',
    opacity,
    // Pulled out of `restProps` so the resolved values win over the raw props
    class: className,
    line = false,
    pathData,
    motion,
    x,
    y0,
    y1,
    z,
    seriesKey,
    ...restProps
  }: AreaBaseProps = $props();

  const c = new AreaState(
    () =>
      ({
        curve,
        data,
        defined,
        fill,
        stroke,
        opacity,
        class: className,
        line,
        pathData,
        motion,
        x,
        y0,
        y1,
        z,
        seriesKey,
      }) as AreaProps
  );

  /**
   * The props that describe the mark as a whole rather than one of its paths.
   *
   * An `<Area line>` draws two paths — the filled body and the top curve — so anything that
   * clips or filters "the area" has to reach both, or a reveal mask wipes the fill in while
   * the curve appears instantly.  Only these are forwarded: `id` and event handlers stay on
   * the fill path alone, so nothing is duplicated and the pointer fires once.  Whatever
   * `line={{ ... }}` sets wins, since it is spread after.
   */
  const sharedLineProps = $derived({
    mask: restProps.mask,
    filter: restProps.filter,
    'clip-path': restProps['clip-path'],
  });
</script>

{#if c.areas}
  <!-- Grouped by `z` — one area (and line) per group, from this one mark -->
  {#each c.areas as area, i (i)}
    {#if line}
      <Spline
        data={area.data}
        {x}
        y={c.lineYAccessor}
        {seriesKey}
        {curve}
        {defined}
        stroke={area.fill}
        {motion}
        {...sharedLineProps}
        {...extractLayerProps(line, 'lc-area-line')}
      />
    {/if}

    <Path
      pathData={area.d}
      fill={area.fill}
      stroke={area.stroke}
      opacity={area.opacity ?? c.pathOpacity}
      {...extractLayerProps(restProps, 'lc-area-path', area.class ?? '')}
    />
  {/each}
{:else}
  {#if line}
    <Spline
      data={data ?? c.seriesData}
      {x}
      y={c.lineYAccessor}
      {seriesKey}
      {curve}
      {defined}
      {motion}
      {...sharedLineProps}
      {...extractLayerProps(line, 'lc-area-line')}
    />
  {/if}

  <Path
    pathData={c.tweenedPath}
    fill={c.resolvedFill}
    stroke={c.resolvedStroke}
    opacity={c.resolvedOpacity ?? c.pathOpacity}
    {...extractLayerProps(restProps, 'lc-area-path', c.resolvedClass ?? '')}
  />
{/if}
